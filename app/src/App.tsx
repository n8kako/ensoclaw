import { Suspense, memo, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  DataTexture,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  RedFormat,
  Texture,
  Vector3,
  VectorKeyframeTrack,
} from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import './App.css';

type CharacterClipPreferences = {
  idle: readonly string[];
  idleWeights?: readonly number[];
  walk: string | null;
  run: string | null;
  jump: string | null;
};

type Agent = {
  id: string;
  name: string;
};

type CharacterDefinition = {
  id: string;
  label: string;
  modelUrl: string;
  uiHeight: number;
  idleAnimationUrls: readonly string[];
  walkAnimationUrl: string;
  runAnimationUrl: string;
  jumpAnimationUrl: string;
  clips: CharacterClipPreferences;
};

const CHARACTER_DEFINITIONS = {
  zero: {
    id: 'zero',
    label: 'Zero',
    uiHeight: 1.5,
    modelUrl: '/models/biped7_character.glb',
    idleAnimationUrls: ['/models/biped7_idle_with_skin.glb'],
    walkAnimationUrl: '/models/biped7_walking_with_skin.glb',
    runAnimationUrl: '/models/biped7_running_with_skin.glb',
    jumpAnimationUrl: '/models/biped7_regular_jump_with_skin.glb',
    clips: {
      idle: ['Idle'],
      walk: 'Walking',
      run: 'Running',
      jump: 'Regular_Jump',
    },
  },
  lelouch: {
    id: 'lelouch',
    label: 'Lelouch',
    uiHeight: 2,
    modelUrl: '/models/lelouch_character.glb',
    idleAnimationUrls: ['/models/lelouch_idle_3_with_skin.glb'],
    walkAnimationUrl: '/models/lelouch_walking_with_skin.glb',
    runAnimationUrl: '/models/lelouch_running_with_skin.glb',
    jumpAnimationUrl: '/models/lelouch_regular_jump_with_skin.glb',
    clips: {
      idle: ['Idle_3'],
      walk: 'walking_man',
      run: 'running',
      jump: 'Regular_Jump',
    },
  },
  theta: {
    id: 'theta',
    label: 'Theta',
    uiHeight: 2,
    modelUrl: '/models/theta_character.glb',
    idleAnimationUrls: [
      '/models/theta_idle_11_with_skin.glb',
      '/models/theta_idle_mirror_viewing_with_skin.glb',
      '/models/theta_idle_15_with_skin.glb',
    ],
    walkAnimationUrl: '/models/theta_walking_with_skin.glb',
    runAnimationUrl: '/models/theta_running_with_skin.glb',
    jumpAnimationUrl: '/models/theta_regular_jump_with_skin.glb',
    clips: {
      idle: ['Idle_11', 'Mirror_Viewing', 'Idle_15'],
      idleWeights: [0.6, 0.2, 0.2],
      walk: 'walking_man',
      run: 'running',
      jump: 'Regular_Jump',
    },
  },
} as const satisfies Record<string, CharacterDefinition>;

type CharacterId = keyof typeof CHARACTER_DEFINITIONS;
const CHARACTER_IDS = Object.keys(CHARACTER_DEFINITIONS) as CharacterId[];
const DEFAULT_CHARACTER_ID: CharacterId = 'zero';

const JUMP_DURATION = 0.78;
const JUMP_HEIGHT = 0.72;
const JUMP_WINDUP_SKIP_TIME = 0.5;
const JUMP_LANDING_TRIM_TIME = 0.8;
const JUMP_ANIMATION_SPEED = 0.6;
const JUMP_ROOT_Y_SCALE = 3.0;

const GRID_SIZE = 180;
const GRID_DIVISIONS = 90;
const PLAY_BOUNDS = GRID_SIZE * 0.45;

const CHARACTER_HEIGHT = 0.03;
const FLOOR_CLEARANCE = 0.03;

const MOVE_SPEED = 6.5;
const SPRINT_SPEED_MULTIPLIER = 1.7;
const TURN_STIFFNESS = 12;
const CAMERA_STIFFNESS = 8;
const LOOK_AT_HEIGHT = 1.35;

const ISO_FORWARD = new Vector3(-1, 0, -1).normalize();
const ISO_RIGHT = new Vector3(1, 0, -1).normalize();
const CAMERA_OFFSET_BASE = new Vector3(17, 13, 17);
const CAMERA_OFFSET_DIRECTION = CAMERA_OFFSET_BASE.clone().normalize();
const CAMERA_DISTANCE_DEFAULT = CAMERA_OFFSET_BASE.length();
const CAMERA_DISTANCE_MIN = 11;
const CAMERA_DISTANCE_MAX = 40;
const CAMERA_ZOOM_SPEED = 0.015;
const CAMERA_START: [number, number, number] = [17, 13, 17];
const OPENCLAW_CHAT_ENDPOINT = '/v1/chat/completions';
const OPENCLAW_DEFAULT_AGENT_ID = 'enso';
const OPENCLAW_SESSION_KEY = `agent:${OPENCLAW_DEFAULT_AGENT_ID}:spatial:main`;
const OPENCLAW_BEARER_TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN;
const FIXED_NPC_AGENT: Agent = { id: OPENCLAW_DEFAULT_AGENT_ID, name: 'Enso' };


const ROOT_POSITION_TRACK_PATTERN = /(^|[/.])(Hips|mixamorigHips|Root|root|Armature)\.position$/;
const SCALE_TRACK_PATTERN = /\.scale$/;

const TOON_GRADIENT_MAP = (() => {
  const gradientData = new Uint8Array([72, 136, 200, 255]);
  const gradientMap = new DataTexture(gradientData, gradientData.length, 1, RedFormat);
  gradientMap.minFilter = NearestFilter;
  gradientMap.magFilter = NearestFilter;
  gradientMap.generateMipmaps = false;
  gradientMap.needsUpdate = true;
  return gradientMap;
})();

type ControlKey = 'forward' | 'backward' | 'left' | 'right' | 'run' | 'jump';
type ControlState = Record<ControlKey, boolean>;
type ChatMessage = { role: 'user' | 'assistant'; content: string };
type ChatStatus = 'idle' | 'loading' | 'error';

const SCENE_BACKGROUND_COLOR = '#9bd7ff';
const SCENE_GROUND_COLOR = '#5fa85a';
const SCENE_AMBIENT_COLOR = '#ffffff';
const SCENE_AMBIENT_INTENSITY = 0.8;
const SCENE_HEMI_SKY_COLOR = '#9bd7ff';
const SCENE_HEMI_GROUND_COLOR = '#4f7f45';
const SCENE_HEMI_INTENSITY = 1;
const NPC_AGENT_IDLE_CLIP_NAME = 'Idle';
const NPC_AGENT_POSITION: [number, number, number] = [5, 0, 5];
const NPC_INTERACTION_DISTANCE = 5;
const WORLD_UP_VECTOR = new Vector3(0, 1, 0);

const DEFAULT_CONTROLS: ControlState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false,
  jump: false,
};

function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const shortest = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + shortest * (1 - Math.exp(-lambda * delta));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeInPlaceClip(clip: AnimationClip, rootYScale = 1) {
  const inPlaceClip = clip.clone();
  inPlaceClip.name = `${clip.name}_InPlace`;

  inPlaceClip.tracks = inPlaceClip.tracks
    .filter((track) => !SCALE_TRACK_PATTERN.test(track.name))
    .map((track) => {
      if (!(track instanceof VectorKeyframeTrack)) {
        return track;
      }

      if (!ROOT_POSITION_TRACK_PATTERN.test(track.name)) {
        return track;
      }

      const values = track.values.slice();
      if (values.length < 3) {
        return track;
      }

      const baseX = values[0];
      const baseZ = values[2];
      const baseY = values[1];

      for (let i = 0; i < values.length; i += 3) {
        values[i] = baseX;
        values[i + 2] = baseZ;
        if (rootYScale !== 1) {
          values[i + 1] = baseY + (values[i + 1] - baseY) * rootYScale;
        }
      }

      return new VectorKeyframeTrack(track.name, track.times.slice(), values, track.getInterpolation());
    });

  inPlaceClip.resetDuration();
  return inPlaceClip;
}

function extractPlayableClips(animations: AnimationClip[] = []) {
  return animations.filter((clip) => clip.duration > 0.01);
}

function normalizeClipName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function selectClip(clips: AnimationClip[], preferredName: string | null, label: string) {
  if (!preferredName) {
    return null;
  }

  if (clips.length === 0) {
    console.warn('[anim] no clips available for ' + label + '.');
    return null;
  }

  const exact = clips.find((clip) => clip.name === preferredName);
  if (exact) {
    return exact;
  }

  const normalizedPreferred = normalizeClipName(preferredName);
  const fuzzy = clips.find((clip) => {
    const normalizedCandidate = normalizeClipName(clip.name);
    return (
      normalizedCandidate === normalizedPreferred ||
      normalizedCandidate.includes(normalizedPreferred) ||
      normalizedPreferred.includes(normalizedCandidate)
    );
  });

  if (fuzzy) {
    console.warn(
      '[anim] preferred ' + label + ' clip "' + preferredName + '" not found, using "' + fuzzy.name + '".',
    );
    return fuzzy;
  }

  console.warn(
    '[anim] preferred ' + label + ' clip "' + preferredName + '" not found. Using "' + clips[0].name + '".',
  );
  return clips[0];
}

function clampWeights(weights: readonly number[] | undefined, defaultCount: number) {
  const safeDefault = defaultCount > 0 ? 1 / defaultCount : 0;
  if (!weights || weights.length === 0) {
    return Array.from({ length: defaultCount }, () => safeDefault);
  }

  const validWeights = weights.map((weight) => (Number.isFinite(weight) && weight > 0 ? weight : 0));
  const totalWeight = validWeights.reduce((sum, weight) => sum + weight, 0);

  if (totalWeight <= 0) {
    return Array.from({ length: defaultCount }, () => safeDefault);
  }

  const normalized = validWeights.map((weight) => weight / totalWeight);
  if (normalized.length >= defaultCount) {
    return normalized.slice(0, defaultCount);
  }

  return [...normalized, ...Array.from({ length: defaultCount - normalized.length }, () => safeDefault)];
}

function isCharacterMesh(mesh: Mesh) {
  if ((mesh as unknown as { isSkinnedMesh?: boolean }).isSkinnedMesh) {
    return true;
  }

  let current: Object3D | null = mesh;
  while (current) {
    const lowerName = current.name.toLowerCase();
    if (lowerName.includes('armature') || lowerName.includes('mixamorig') || lowerName.includes('hips')) {
      return true;
    }
    current = current.parent;
  }

  return false;
}

function isFiniteVector(vector: Vector3) {
  return Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);
}

function prepareModel(scene: Object3D) {
  const clone = SkeletonUtils.clone(scene) as Object3D;
  clone.updateWorldMatrix(true, true);

  const box = new Box3().setFromObject(clone);
  const size = new Vector3();
  box.getSize(size);

  const safeHeight = Math.max(size.y, 0.001);
  const scale = CHARACTER_HEIGHT / safeHeight;

  clone.scale.setScalar(scale);
  clone.updateWorldMatrix(true, true);

  const scaledBox = new Box3().setFromObject(clone);
  clone.position.set(0, -scaledBox.min.y + FLOOR_CLEARANCE, 0);

  clone.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    if (!isCharacterMesh(mesh)) {
      return;
    }

    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const toonMaterials = sourceMaterials.map((material) => {
      const source = material as {
        map?: Texture | null;
        color?: Color;
        transparent?: boolean;
        opacity?: number;
        side?: MeshToonMaterial['side'];
        alphaTest?: number;
        emissive?: Color;
        emissiveMap?: Texture | null;
        name?: string;
      };

      const sourceMap = source.map ?? null;
      const toonMaterial = new MeshToonMaterial({
        // Preserve original albedo texture and avoid dark color multiplication.
        color: sourceMap ? new Color('#ffffff') : source.color?.clone() ?? new Color('#f4f4f4'),
        map: sourceMap,
        gradientMap: TOON_GRADIENT_MAP,
        transparent: Boolean(source.transparent),
        opacity: typeof source.opacity === 'number' ? source.opacity : 1,
        alphaTest: typeof source.alphaTest === 'number' ? source.alphaTest : 0,
        side: source.side,
      });

      if (sourceMap) {
        sourceMap.needsUpdate = true;
      }

      toonMaterial.color.setHex(0xffffff);
      toonMaterial.name = (source.name ?? 'toon_material') + '_toon';
      (toonMaterial as unknown as { skinning?: boolean }).skinning = Boolean(
        (mesh as { isSkinnedMesh?: boolean }).isSkinnedMesh,
      );
      toonMaterial.needsUpdate = true;
      return toonMaterial;
    });

    mesh.material = Array.isArray(mesh.material) ? toonMaterials : toonMaterials[0];

    
  });

  return clone;
}

function useKeyboardControls() {
  const controlsRef = useRef<ControlState>({ ...DEFAULT_CONTROLS });

  useEffect(() => {
    const codeToControl: Partial<Record<string, ControlKey>> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'backward',
      ArrowDown: 'backward',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      ShiftLeft: 'run',
      ShiftRight: 'run',
      Space: 'jump',
    };

    const setControl = (code: string, active: boolean) => {
      const key = codeToControl[code];
      if (!key) {
        return;
      }
      controlsRef.current[key] = active;
    };

    const isTypingInInput = () => {
      const activeElement = document.activeElement;
      if (!activeElement) {
        return false;
      }

      const tagName = activeElement.tagName;
      return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingInInput()) {
        return;
      }

      if (codeToControl[event.code]) {
        event.preventDefault();
      }
      setControl(event.code, true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isTypingInInput()) {
        return;
      }

      if (codeToControl[event.code]) {
        event.preventDefault();
      }
      setControl(event.code, false);
    };

    const clearControls = () => {
      controlsRef.current = { ...DEFAULT_CONTROLS };
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        clearControls();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearControls);
    window.addEventListener('focusin', onFocusIn);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearControls);
      window.removeEventListener('focusin', onFocusIn);
    };
  }, []);

  return controlsRef;
}

const Character = memo(function Character({
  controlsRef,
  character,
  characterRootRef: externalCharacterRootRef,
  isChatting,
}: {
  controlsRef: MutableRefObject<ControlState>;
  character: CharacterDefinition;
  characterRootRef?: MutableRefObject<Group | null>;
  isChatting: boolean;
}) {
  const moveDirection = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());
  const cameraOffset = useRef(new Vector3());
  const lookTarget = useRef(new Vector3());
  const characterRootRef = useRef<Group>(null);
  const cameraDistanceRef = useRef(CAMERA_DISTANCE_DEFAULT);

  const loadedModel = useGLTF(character.modelUrl);
  const idleAnimationUrls = useMemo(() => {
    const urls = character.idleAnimationUrls;
    return [urls[0], urls[1] ?? urls[0], urls[2] ?? urls[0]];
  }, [character.idleAnimationUrls]);

  const loadedIdleAnimationA = useGLTF(idleAnimationUrls[0]);
  const loadedIdleAnimationB = useGLTF(idleAnimationUrls[1]);
  const loadedIdleAnimationC = useGLTF(idleAnimationUrls[2]);
  const loadedWalkAnimations = useGLTF(character.walkAnimationUrl);
  const loadedRunAnimations = useGLTF(character.runAnimationUrl);
  const loadedJumpAnimations = useGLTF(character.jumpAnimationUrl);

  const modelGltf = Array.isArray(loadedModel) ? loadedModel[0] : loadedModel;
  const idleAnimationGltfs = useMemo(
    () => [
      Array.isArray(loadedIdleAnimationA) ? loadedIdleAnimationA[0] : loadedIdleAnimationA,
      Array.isArray(loadedIdleAnimationB) ? loadedIdleAnimationB[0] : loadedIdleAnimationB,
      Array.isArray(loadedIdleAnimationC) ? loadedIdleAnimationC[0] : loadedIdleAnimationC,
    ],
    [loadedIdleAnimationA, loadedIdleAnimationB, loadedIdleAnimationC],
  );
  const walkAnimationGltf = Array.isArray(loadedWalkAnimations) ? loadedWalkAnimations[0] : loadedWalkAnimations;
  const runAnimationGltf = Array.isArray(loadedRunAnimations) ? loadedRunAnimations[0] : loadedRunAnimations;
  const jumpAnimationGltf = Array.isArray(loadedJumpAnimations) ? loadedJumpAnimations[0] : loadedJumpAnimations;

  const model = useMemo(() => prepareModel(modelGltf.scene), [modelGltf]);
  const idleClips = useMemo<AnimationClip[]>(() => {
    const clipsMap = new Map<string, AnimationClip>();
    for (const idleAnimationGltf of idleAnimationGltfs) {
      const clipsFromGltf = extractPlayableClips(idleAnimationGltf.animations as AnimationClip[]);
      for (const clip of clipsFromGltf) {
        if (!clipsMap.has(clip.name)) {
          clipsMap.set(clip.name, clip);
        }
      }
    }

    return [...clipsMap.values()];
  }, [idleAnimationGltfs]);
  const walkClips = useMemo<AnimationClip[]>(
    () => extractPlayableClips(walkAnimationGltf.animations as AnimationClip[]),
    [walkAnimationGltf],
  );
  const runClips = useMemo<AnimationClip[]>(
    () => extractPlayableClips(runAnimationGltf.animations as AnimationClip[]),
    [runAnimationGltf],
  );
  const jumpClips = useMemo<AnimationClip[]>(
    () => extractPlayableClips(jumpAnimationGltf.animations as AnimationClip[]),
    [jumpAnimationGltf],
  );
  const clips = useMemo<AnimationClip[]>(
    () => [...idleClips, ...walkClips, ...runClips, ...jumpClips],
    [idleClips, walkClips, runClips, jumpClips],
  );

  const idleWeights = useMemo(
    () => clampWeights(character.clips.idleWeights, character.clips.idle.length),
    [character.clips.idle.length, character.clips.idleWeights],
  );
  const idleCandidates = useMemo(
    () => {
      const mergedCandidates = new Map<string, { clip: AnimationClip; weight: number }>();

      for (let i = 0; i < character.clips.idle.length; i++) {
        const name = character.clips.idle[i];
        const clip = selectClip(idleClips, name, 'idle');
        if (!clip) {
          continue;
        }

        const weight = idleWeights[i] ?? 0;
        const existing = mergedCandidates.get(clip.name);
        if (!existing) {
          mergedCandidates.set(clip.name, { clip, weight });
        } else {
          existing.weight += weight;
        }
      }

      const candidates = [...mergedCandidates.values()];
      if (!candidates.length && idleClips.length > 0) {
        console.warn(
          `[anim] no configured idle clips found for "${character.id}", using first available idle animation "${idleClips[0]?.name || 'unknown'}".`,
        );
        candidates.push({ clip: idleClips[0], weight: 1 });
      }

      return candidates;
    },
    [character.clips.idle, idleClips, idleWeights],
  );
  const walkSource = useMemo(() => selectClip(walkClips, character.clips.walk, 'walk'), [walkClips, character.clips.walk]);
  const runSource = useMemo(() => selectClip(runClips, character.clips.run, 'run'), [runClips, character.clips.run]);
  const jumpSource = useMemo(() => selectClip(jumpClips, character.clips.jump, 'jump'), [jumpClips, character.clips.jump]);

  const mixerRef = useRef<AnimationMixer | null>(null);
  const idleActionRef = useRef<AnimationAction | null>(null);
  const idleActionPoolRef = useRef<AnimationAction[]>([]);
  const idleActionWeightsRef = useRef<number[]>([]);
  const walkActionRef = useRef<AnimationAction | null>(null);
  const runActionRef = useRef<AnimationAction | null>(null);
  const jumpActionRef = useRef<AnimationAction | null>(null);
  const idleActionOrderRef = useRef<number[]>([]);
  const idleActionOrderCursorRef = useRef(0);
  const shouldUseSingleIdle = character.id === 'zero' || character.modelUrl.includes('/biped7_character.glb');
  const isIdlePlayingRef = useRef(false);
  const isWalkPlayingRef = useRef(false);
  const isRunPlayingRef = useRef(false);
  const isJumpPlayingRef = useRef(false);
  const previousJumpPressedRef = useRef(false);
  const jumpElapsedRef = useRef(0);

  const buildIdleActionOrder = () => {
    const pool = idleActionPoolRef.current;
    const weights = idleActionWeightsRef.current;

    if (!pool.length) {
      idleActionOrderRef.current = [];
      idleActionOrderCursorRef.current = 0;
      return;
    }

    if (shouldUseSingleIdle) {
      idleActionOrderRef.current = [0];
      idleActionOrderCursorRef.current = 0;
      return;
    }

    const availableIndexes = pool.map((_, index) => index);
    const availableWeights = availableIndexes.map((index) => weights[index] ?? 1);
    const newOrder: number[] = [];

    while (availableIndexes.length > 0) {
      const totalWeight = availableWeights.reduce((sum, weight) => sum + (Number.isFinite(weight) ? weight : 0), 0);
      const shouldRandomize = totalWeight <= 0;

      let selectedPosition = 0;
      if (!shouldRandomize) {
        let target = Math.random() * totalWeight;
        for (let i = 0; i < availableIndexes.length; i++) {
          target -= Number.isFinite(availableWeights[i]) ? availableWeights[i] : 0;
          if (target <= 0) {
            selectedPosition = i;
            break;
          }
        }
      } else {
        selectedPosition = Math.floor(Math.random() * availableIndexes.length);
      }

      newOrder.push(availableIndexes[selectedPosition]!);
      availableIndexes.splice(selectedPosition, 1);
      availableWeights.splice(selectedPosition, 1);
    }

    idleActionOrderRef.current = newOrder;
    idleActionOrderCursorRef.current = 0;
  };

  const pickNextIdleAction = () => {
    if (!idleActionPoolRef.current.length) {
      return null;
    }

    if (shouldUseSingleIdle) {
      return idleActionPoolRef.current[0] ?? null;
    }

    if (!idleActionOrderRef.current.length || idleActionOrderCursorRef.current >= idleActionOrderRef.current.length) {
      buildIdleActionOrder();
    }

    const order = idleActionOrderRef.current;
    const orderIndex = idleActionOrderCursorRef.current;
    const poolIndex = order[orderIndex] ?? 0;
    const pool = idleActionPoolRef.current;

    idleActionOrderCursorRef.current += 1;
    return pool[poolIndex] ?? pool[0] ?? null;
  };

  const isIdleActionFinished = (action: AnimationAction | null) => {
    if (!action) {
      return true;
    }

    const clipDuration = action.getClip().duration;
    if (!Number.isFinite(clipDuration) || clipDuration <= 0) {
      return true;
    }

    const epsilon = 0.05;
    return action.time >= clipDuration - epsilon;
  };

  useEffect(() => {
    console.info('[anim] available clips:', clips.map((clip) => clip.name));
  }, [clips]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraDistanceRef.current = clamp(
        cameraDistanceRef.current + event.deltaY * CAMERA_ZOOM_SPEED,
        CAMERA_DISTANCE_MIN,
        CAMERA_DISTANCE_MAX,
      );
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    const createAction = (
      clip: AnimationClip | null,
      loopMode: typeof LoopRepeat | typeof LoopOnce = LoopRepeat,
      clampWhenFinished = false,
      rootYScale = 1,
    ) => {
      if (!clip) {
        return null;
      }

      const inPlaceClip = makeInPlaceClip(clip, rootYScale);
      const action = mixer.clipAction(inPlaceClip, model);
      action.loop = loopMode;
      action.clampWhenFinished = clampWhenFinished;
      action.enabled = true;
      return action;
    };

    const idleActions = idleCandidates
      .map((candidate) =>
        createAction(candidate.clip, shouldUseSingleIdle ? LoopRepeat : LoopOnce, shouldUseSingleIdle ? false : true),
      )
      .filter((action): action is AnimationAction => action !== null);
    const idleActionWeights = clampWeights(
      idleCandidates.map((candidate) => candidate.weight),
      idleActions.length,
    );

    const walkAction = createAction(walkSource);
    const runAction = createAction(runSource);
    const jumpAction = createAction(jumpSource, LoopOnce, true, JUMP_ROOT_Y_SCALE);

    idleActionPoolRef.current = idleActions;
    idleActionWeightsRef.current = idleActionWeights;
    buildIdleActionOrder();
    idleActionRef.current = pickNextIdleAction();
    walkActionRef.current = walkAction;
    runActionRef.current = runAction;
    jumpActionRef.current = jumpAction;

    console.info(
      `[anim] selected clips -> idle: ${idleCandidates.map((candidate) => candidate.clip.name).join(', ') || 'none'} (in-place), walk: ${
        walkSource?.name ?? 'none'
      } (in-place), run: ${runSource?.name ?? 'none'} (in-place), jump: ${jumpSource?.name ?? 'none'} (in-place)`,
    );

    isIdlePlayingRef.current = false;
    isWalkPlayingRef.current = false;
    isRunPlayingRef.current = false;
    isJumpPlayingRef.current = false;
    previousJumpPressedRef.current = false;
    jumpElapsedRef.current = 0;

    if (idleActionRef.current) {
      if (shouldUseSingleIdle) {
        idleActionRef.current.reset().play();
      } else {
        idleActionRef.current.reset().fadeIn(0.22).play();
      }
      isIdlePlayingRef.current = true;
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      mixerRef.current = null;
      idleActionRef.current = null;
      idleActionPoolRef.current = [];
      idleActionWeightsRef.current = [];
      idleActionOrderRef.current = [];
      idleActionOrderCursorRef.current = 0;
      walkActionRef.current = null;
      runActionRef.current = null;
      jumpActionRef.current = null;
      isIdlePlayingRef.current = false;
      isWalkPlayingRef.current = false;
      isRunPlayingRef.current = false;
      isJumpPlayingRef.current = false;
      jumpElapsedRef.current = 0;
    };
  }, [model, clips, walkSource, runSource, jumpSource, idleCandidates]);

  useFrame((state, delta) => {
    const { camera } = state;
    const characterRoot = characterRootRef.current;
    if (!characterRoot) {
      return;
    }

    mixerRef.current?.update(delta);

    const controls = controlsRef.current;
    const jumpAction = jumpActionRef.current;
    let xAxis = Number(controls.right) - Number(controls.left);
    let zAxis = Number(controls.forward) - Number(controls.backward);
    let isMoving = xAxis !== 0 || zAxis !== 0;
    let isSprinting = isMoving && controls.run;

    let jumpPressed = controls.jump;
    let jumpJustPressed = jumpPressed && !previousJumpPressedRef.current;
    if (isChatting) {
      xAxis = 0;
      zAxis = 0;
      isMoving = false;
      isSprinting = false;
      jumpPressed = false;
      jumpJustPressed = false;
      previousJumpPressedRef.current = false;

      if (jumpAction && isJumpPlayingRef.current) {
        jumpAction.stop();
        isJumpPlayingRef.current = false;
        jumpElapsedRef.current = 0;
        isIdlePlayingRef.current = false;
        isWalkPlayingRef.current = false;
        isRunPlayingRef.current = false;
      }
    }
    previousJumpPressedRef.current = jumpPressed;

    if (isMoving) {
      moveDirection.current.copy(ISO_RIGHT).multiplyScalar(xAxis).addScaledVector(ISO_FORWARD, zAxis).normalize();

      const speed = MOVE_SPEED * (isSprinting ? SPRINT_SPEED_MULTIPLIER : 1);
      characterRoot.position.addScaledVector(moveDirection.current, speed * delta);

      characterRoot.position.x = clamp(characterRoot.position.x, -PLAY_BOUNDS, PLAY_BOUNDS);
      characterRoot.position.z = clamp(characterRoot.position.z, -PLAY_BOUNDS, PLAY_BOUNDS);

      const targetRotation = Math.atan2(moveDirection.current.x, moveDirection.current.z);
      characterRoot.rotation.y = dampAngle(characterRoot.rotation.y, targetRotation, TURN_STIFFNESS, delta);
    }

    const idleAction = idleActionRef.current;
    const walkAction = walkActionRef.current;
    const runAction = runActionRef.current;

    if (jumpJustPressed && !isJumpPlayingRef.current) {
      isJumpPlayingRef.current = true;
      jumpElapsedRef.current = 0;

      if (jumpAction) {
        let currentAction: AnimationAction | null = null;
        if (runAction && isRunPlayingRef.current) {
          currentAction = runAction;
        } else if (walkAction && isWalkPlayingRef.current) {
          currentAction = walkAction;
        } else if (idleAction && isIdlePlayingRef.current) {
          currentAction = idleAction;
        }

        jumpAction.setLoop(LoopOnce, 1);
        jumpAction.clampWhenFinished = true;
        jumpAction.timeScale = JUMP_ANIMATION_SPEED;
        jumpAction.reset();
        jumpAction.time = Math.min(
          JUMP_WINDUP_SKIP_TIME,
          Math.max(jumpAction.getClip().duration - 0.001, 0),
        );

        if (currentAction) {
          jumpAction.crossFadeFrom(currentAction, 0.14, false).play();
        } else {
          jumpAction.fadeIn(0.1).play();
        }

        isIdlePlayingRef.current = false;
        isWalkPlayingRef.current = false;
        isRunPlayingRef.current = false;
      }
    }

    let jumpOffset = 0;
    if (isJumpPlayingRef.current && !jumpAction) {
      jumpElapsedRef.current += delta;
      const t = Math.min(jumpElapsedRef.current / JUMP_DURATION, 1);
      jumpOffset = 4 * JUMP_HEIGHT * t * (1 - t);

      if (t >= 1) {
        isJumpPlayingRef.current = false;
        jumpElapsedRef.current = 0;
        jumpOffset = 0;
      }
    }
      characterRoot.position.y = jumpOffset;

    if (jumpAction && isJumpPlayingRef.current) {
      const clipDuration = jumpAction.getClip().duration;
      const landingCutTime = Math.max(JUMP_WINDUP_SKIP_TIME, clipDuration - JUMP_LANDING_TRIM_TIME);
      if (jumpAction.time >= landingCutTime) {
        isJumpPlayingRef.current = false;
        jumpElapsedRef.current = 0;

        const nextAction = !isMoving
          ? shouldUseSingleIdle
            ? idleAction ?? pickNextIdleAction()
            : pickNextIdleAction()
          : isSprinting
            ? runAction ?? walkAction
            : walkAction ?? runAction;

        if (nextAction) {
          nextAction.reset().crossFadeFrom(jumpAction, 0.12, false).play();
        } else {
          jumpAction.fadeOut(0.12);
        }

        const isNextActionIdle = nextAction ? idleActionPoolRef.current.includes(nextAction) : false;
        isIdlePlayingRef.current = isNextActionIdle;
        if (isIdlePlayingRef.current) {
          idleActionRef.current = nextAction;
        } else if (nextAction && nextAction !== walkAction && nextAction !== runAction) {
          idleActionRef.current = null;
        }
        isWalkPlayingRef.current = nextAction === walkAction;
        isRunPlayingRef.current = nextAction === runAction;
      }
    }

    if (jumpAction && isJumpPlayingRef.current) {
      if (idleAction && isIdlePlayingRef.current) {
        idleAction.fadeOut(0.08);
        isIdlePlayingRef.current = false;
      }
      if (walkAction && isWalkPlayingRef.current) {
        walkAction.fadeOut(0.08);
        isWalkPlayingRef.current = false;
      }
      if (runAction && isRunPlayingRef.current) {
        runAction.fadeOut(0.08);
        isRunPlayingRef.current = false;
      }
    } else if (!isMoving) {
      if (walkAction && isWalkPlayingRef.current) {
        walkAction.fadeOut(0.2);
        isWalkPlayingRef.current = false;
      }
      if (runAction && isRunPlayingRef.current) {
        runAction.fadeOut(0.2);
        isRunPlayingRef.current = false;
      }

      const needsIdleAction = shouldUseSingleIdle
        ? !isIdlePlayingRef.current
        : !isIdlePlayingRef.current || isIdleActionFinished(idleAction);
      if (needsIdleAction) {
        const nextIdleAction = shouldUseSingleIdle
          ? idleAction ?? pickNextIdleAction()
          : pickNextIdleAction();
        if (nextIdleAction) {
          if (shouldUseSingleIdle) {
            nextIdleAction.reset().fadeIn(0.2).play();
          } else {
            if (idleAction && idleAction !== nextIdleAction) {
              nextIdleAction.reset().crossFadeFrom(idleAction, 0.2, false).play();
            } else {
              nextIdleAction.reset().fadeIn(0.2).play();
            }
          }

          idleActionRef.current = nextIdleAction;
          isIdlePlayingRef.current = true;
        }
      }
    } else {
      const targetAction = isSprinting ? runAction ?? walkAction : walkAction ?? runAction;
      const targetIsRun = targetAction === runAction;

      if (idleAction && isIdlePlayingRef.current) {
        idleAction.fadeOut(0.16);
        isIdlePlayingRef.current = false;
        if (idleActionRef.current === idleAction && !shouldUseSingleIdle) {
          idleActionRef.current = null;
        }
      }

      if (targetIsRun) {
        if (walkAction && isWalkPlayingRef.current) {
          walkAction.fadeOut(0.12);
          isWalkPlayingRef.current = false;
        }
        if (runAction && !isRunPlayingRef.current) {
          runAction.reset().fadeIn(0.16).play();
          isRunPlayingRef.current = true;
        }
      } else {
        if (runAction && isRunPlayingRef.current) {
          runAction.fadeOut(0.12);
          isRunPlayingRef.current = false;
        }
        if (walkAction && !isWalkPlayingRef.current) {
          walkAction.reset().fadeIn(0.16).play();
          isWalkPlayingRef.current = true;
        }
      }
    }

    if (!isChatting) {
      cameraOffset.current.copy(CAMERA_OFFSET_DIRECTION).multiplyScalar(cameraDistanceRef.current);
      cameraTarget.current.copy(characterRoot.position).add(cameraOffset.current);
      camera.position.x = damp(camera.position.x, cameraTarget.current.x, CAMERA_STIFFNESS, delta);
      camera.position.y = damp(camera.position.y, cameraTarget.current.y, CAMERA_STIFFNESS, delta);
      camera.position.z = damp(camera.position.z, cameraTarget.current.z, CAMERA_STIFFNESS, delta);

      lookTarget.current.copy(characterRoot.position);
      lookTarget.current.y += LOOK_AT_HEIGHT;
      camera.lookAt(lookTarget.current);
    }
  });

  return (
    <group
      ref={(root) => {
        characterRootRef.current = root;
        if (externalCharacterRootRef) {
          externalCharacterRootRef.current = root;
        }
      }}
      position={[0, 0, 0]}
    >
      <primitive object={model} />
    </group>
  );
});

const NPCCharacter = memo(function NPCCharacter({
  characterRootRef,
  agent,
  showTalkPrompt,
  chatStatus,
  showTypingIndicator,
  uiHeight,
  isChatting,
  position,
}: {
  characterRootRef?: MutableRefObject<Group | null>;
  agent: Agent;
  showTalkPrompt: boolean;
  chatStatus: ChatStatus;
  showTypingIndicator: boolean;
  uiHeight: number;
  isChatting: boolean;
  position?: [number, number, number];
}) {
  void agent;
  void uiHeight;

  const loadedModel = useGLTF(CHARACTER_DEFINITIONS.zero.modelUrl);
  const loadedIdle = useGLTF(CHARACTER_DEFINITIONS.zero.idleAnimationUrls[0]);
  const modelGltf = Array.isArray(loadedModel) ? loadedModel[0] : loadedModel;
  const idleGltf = Array.isArray(loadedIdle) ? loadedIdle[0] : loadedIdle;
  const model = useMemo(() => prepareModel(modelGltf.scene), [modelGltf]);
  const idleClips = useMemo<AnimationClip[]>(() => extractPlayableClips(idleGltf.animations as AnimationClip[]), [idleGltf]);
  const idleSource = useMemo(() => selectClip(idleClips, NPC_AGENT_IDLE_CLIP_NAME, 'idle'), [idleClips]);
  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    let idleAction: AnimationAction | null = null;
    if (idleSource) {
      const inPlaceClip = makeInPlaceClip(idleSource);
      idleAction = mixer.clipAction(inPlaceClip, model);
      idleAction.loop = LoopRepeat;
      idleAction.enabled = true;
      idleAction.reset().play();
    } else {
      console.warn('[npc] zero idle clip not found, npc will stay static');
    }

    return () => {
      if (idleAction) {
        idleAction.stop();
      }
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      mixerRef.current = null;
    };
  }, [model, idleSource]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return (
    <group
      scale={[1, 1, 1]}
      ref={(root) => {
        if (characterRootRef) {
          characterRootRef.current = root;
        }
      }}
      position={position ?? NPC_AGENT_POSITION}
    >
      {showTalkPrompt && !isChatting ? (
        <group>
          <Html
            center
            position={[0, 3.2, 0]}
            distanceFactor={14}
            zIndexRange={[100, 0]}
            style={{
              transform: 'translate(-50%, -50%)',
              padding: '4px 10px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.75)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              pointerEvents: 'none',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Press E to Talk
          </Html>
        </group>
      ) : null}
      {showTypingIndicator && chatStatus === 'loading' ? (
        <group>
          <Html
            center
            position={[0, 3.2, 0]}
            distanceFactor={14}
            zIndexRange={[100, 0]}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div className="typing-indicator" aria-hidden="true">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </Html>
        </group>
      ) : null}
      <primitive object={model} />
    </group>
  );
});


const Scene = memo(function Scene({
  controlsRef,
  character,
  playerCharacterRef,
  npcAgent,
  activeChatAgent,
  onRangeChange,
  npcChatStatus,
  isChatting,
}: {
  controlsRef: MutableRefObject<ControlState>;
  character: CharacterDefinition;
  playerCharacterRef: MutableRefObject<Group | null>;
  npcAgent: Agent;
  activeChatAgent: Agent | null;
  onRangeChange: (agent: Agent | null) => void;
  npcChatStatus: ChatStatus;
  isChatting: boolean;
}) {
  const playerWorldPosition = useRef(new Vector3());
  const npcWorldPosition = useRef(new Vector3());
  const dialogueCameraPos = useRef(new Vector3());
  const dialogueLookTarget = useRef(new Vector3());
  const dialogueLookSmoothTarget = useRef(new Vector3());
  const directionToNpc = useRef(new Vector3());
  const sideDirection = useRef(new Vector3());
  const npcCharacterRef = useRef<Group | null>(null);
  const nearestNpcRef = useRef<Agent | null>(null);
  const [isNpcInRange, setIsNpcInRange] = useState(false);
  const interactionRadiusSq = NPC_INTERACTION_DISTANCE * NPC_INTERACTION_DISTANCE;

  useFrame((state) => {
    const { camera } = state;
    const playerCharacter = playerCharacterRef.current;
    if (!playerCharacter) {
      return;
    }

    playerCharacter.getWorldPosition(playerWorldPosition.current);
    if (!isFiniteVector(playerWorldPosition.current)) {
      return;
    }

    const npcCharacter = npcCharacterRef.current;
    if (!npcCharacter) {
      return;
    }

    npcCharacter.getWorldPosition(npcWorldPosition.current);
    if (!isFiniteVector(npcWorldPosition.current)) {
      return;
    }

    const distanceSq = playerWorldPosition.current.distanceToSquared(npcWorldPosition.current);
    const isInRange = distanceSq <= interactionRadiusSq;
    if (nearestNpcRef.current?.id !== (isInRange ? npcAgent.id : null)) {
      nearestNpcRef.current = isInRange ? npcAgent : null;
      onRangeChange(isInRange ? npcAgent : null);
      setIsNpcInRange(isInRange);
    }

    const chatTargetAgent = isChatting ? activeChatAgent ?? (isInRange ? npcAgent : null) : isInRange ? npcAgent : null;
    if (!chatTargetAgent) {
      return;
    }

    if (isChatting) {
      dialogueLookTarget.current.copy(npcWorldPosition.current).setY(npcWorldPosition.current.y + 1.5);

      directionToNpc.current.copy(npcWorldPosition.current).sub(playerWorldPosition.current);
      if (directionToNpc.current.lengthSq() === 0) {
        return;
      }
      directionToNpc.current.normalize();
      sideDirection.current.crossVectors(directionToNpc.current, WORLD_UP_VECTOR);

      if (!isFiniteVector(sideDirection.current) || sideDirection.current.lengthSq() === 0) {
        return;
      }

      sideDirection.current.normalize();
      dialogueCameraPos.current
        .copy(playerWorldPosition.current)
        .addScaledVector(directionToNpc.current, -7.2)
        .addScaledVector(sideDirection.current, 3)
        .setY(playerWorldPosition.current.y + 3);

      camera.position.lerp(dialogueCameraPos.current, 0.02);
      dialogueLookSmoothTarget.current.lerp(dialogueLookTarget.current, 0.02);

      const orbitControls = (state as unknown as { controls?: { target: Vector3 } }).controls;
      if (orbitControls?.target && typeof orbitControls.target.lerp === 'function') {
        orbitControls.target.lerp(dialogueLookTarget.current, 0.02);
      } else {
        camera.lookAt(dialogueLookSmoothTarget.current);
      }
      return;
    }
  });

  return (
    <>
      <color attach="background" args={[SCENE_BACKGROUND_COLOR]} />
      <ambientLight color={SCENE_AMBIENT_COLOR} intensity={SCENE_AMBIENT_INTENSITY} />
      <directionalLight color="#fff4e0" position={[10, 20, 10]} intensity={2.5} />
      <directionalLight color="#a0b0d0" position={[-10, 5, -10]} intensity={0.5} />
      <hemisphereLight args={[SCENE_HEMI_SKY_COLOR, SCENE_HEMI_GROUND_COLOR, SCENE_HEMI_INTENSITY]} />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshToonMaterial color={SCENE_GROUND_COLOR} gradientMap={TOON_GRADIENT_MAP} />
      </mesh>

      <gridHelper args={[GRID_SIZE, GRID_DIVISIONS, '#2f5a34', '#4a7f4a']} position={[0, 0.002, 0]} />

      <NPCCharacter
        agent={npcAgent}
        characterRootRef={npcCharacterRef}
        showTalkPrompt={isNpcInRange && !isChatting}
        chatStatus={npcChatStatus}
        showTypingIndicator={Boolean(activeChatAgent?.id === npcAgent.id)}
        uiHeight={character.uiHeight}
        isChatting={isChatting}
        position={NPC_AGENT_POSITION}
      />
      <Character
        controlsRef={controlsRef}
        character={character}
        characterRootRef={playerCharacterRef}
        isChatting={isChatting}
      />
    </>
  );
});

function App() {
  const controlsRef = useKeyboardControls();
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>(DEFAULT_CHARACTER_ID);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [activeTab, setActiveTab] = useState<'chat' | 'context'>('chat');
  const npcAgent = FIXED_NPC_AGENT;
  const [availableContextFiles, setAvailableContextFiles] = useState<string[]>([]);
  const [selectedContextFile, setSelectedContextFile] = useState('');
  const [contextFileListState, setContextFileListState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [contextContent, setContextContent] = useState<string>('');
  const [contextLoadState, setContextLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [targetNpcAgent, setTargetNpcAgent] = useState<Agent | null>(null);
  const [activeChatAgent, setActiveChatAgent] = useState<Agent | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const selectedCharacter = CHARACTER_DEFINITIONS[selectedCharacterId];
  const playerCharacterRef = useRef<Group | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isChatting) {
      requestAnimationFrame(() => {
        chatInputRef.current?.focus();
      });
    }
  }, [isChatting]);

  const endChat = useCallback(() => {
    setIsChatting(false);
    setActiveChatAgent(null);
    controlsRef.current = { ...DEFAULT_CONTROLS };
  }, [controlsRef]);

  const activeAgent: Agent = activeChatAgent ?? npcAgent;

  useEffect(() => {
    let isCancelled = false;

    const loadContextFileList = async () => {
      setContextFileListState('loading');
      const endpoint = `/api/agent-files/${encodeURIComponent(activeAgent.id)}`;

      try {
        const response = await fetch(endpoint, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load context file list (HTTP ${response.status})`);
        }

        const fileList = await response.json();
        const markdownFiles = Array.isArray(fileList)
          ? fileList.filter((file): file is string => typeof file === 'string' && file.toLowerCase().endsWith('.md'))
          : [];

        if (!isCancelled) {
          setAvailableContextFiles(markdownFiles);
          setContextFileListState('idle');
          setSelectedContextFile((prev) => {
            if (prev && markdownFiles.includes(prev)) {
              return prev;
            }

            return markdownFiles[0] ?? '';
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('[openclaw] failed to load context file list', error);
          setAvailableContextFiles([]);
          setContextFileListState('error');
        }
      }
    };

    void loadContextFileList();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isChatting || activeTab !== 'context') {
      return;
    }

    let isCancelled = false;

    const loadContextFile = async () => {
      setContextLoadState('loading');
      setContextContent('');
      try {
        if (!selectedContextFile) {
          setContextLoadState('idle');
          return;
        }

        const path = `/api/agent-files/${encodeURIComponent(activeAgent.id)}/${encodeURIComponent(selectedContextFile)}`;
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load ${selectedContextFile} (HTTP ${response.status})`);
        }

        const text = await response.text();
        if (!isCancelled) {
          setContextContent(text);
          setContextLoadState('idle');
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(`[openclaw] failed to load ${selectedContextFile}`, error);
          setContextContent(`Failed to load ${selectedContextFile}.`);
          setContextLoadState('error');
        }
      }
    };

    void loadContextFile();

    return () => {
      isCancelled = true;
    };
  }, [isChatting, activeTab, selectedContextFile, activeAgent.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' && targetNpcAgent && !isChatting) {
        setActiveChatAgent(targetNpcAgent);
        setChatMessages([]);
        setChatStatus('idle');
        setIsChatting(true);
      }

      if (event.code === 'Escape' && isChatting) {
        endChat();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [targetNpcAgent, isChatting, endChat]);

  const sendToOpenClaw = useCallback(async () => {
    const message = chatInput.trim();
    if (!message || chatStatus === 'loading') {
      return;
    }

    const activeSession = OPENCLAW_SESSION_KEY;

    const userMessage: ChatMessage = { role: 'user', content: message };
    const nextMessages = [...chatMessages, userMessage];

    setChatMessages(nextMessages);
    setChatInput('');
    setChatStatus('loading');

    const payload = {
      model: activeAgent.id,
      session: activeSession,
      messages: nextMessages.map((entry) => ({ role: entry.role, content: entry.content })),
      stream: false,
    };

    try {
      const response = await fetch(OPENCLAW_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENCLAW_BEARER_TOKEN}`,
          'x-openclaw-session-key': activeSession,
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let payloadResponse: unknown = raw;
      if (raw) {
        try {
          payloadResponse = JSON.parse(raw);
        } catch {
          payloadResponse = raw;
        }
      }

      console.log('[openclaw] chat response', {
        endpoint: OPENCLAW_CHAT_ENDPOINT,
        status: response.status,
        ok: response.ok,
        body: payloadResponse,
      });

      if (!response.ok) {
        setChatStatus('error');
        return;
      }

      const decoded = payloadResponse as {
        choices?: Array<{
          message?: { content?: unknown };
          text?: unknown;
        }>;
      };

      const firstChoice = Array.isArray(decoded?.choices) ? decoded.choices[0] : undefined;
      const rawContent = firstChoice?.message?.content;

      let assistantText = '';
      if (typeof rawContent === 'string') {
        assistantText = rawContent;
      } else if (Array.isArray(rawContent)) {
        assistantText = rawContent
          .map((part) => {
            if (typeof part === 'string') {
              return part;
            }

            if (part && typeof part === 'object' && 'text' in part) {
              const textPart = (part as { text?: unknown }).text;
              return typeof textPart === 'string' ? textPart : '';
            }

            return '';
          })
          .join('')
          .trim();
      } else if (typeof firstChoice?.text === 'string') {
        assistantText = firstChoice.text;
      }

      if (!assistantText) {
        setChatStatus('error');
        return;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      setChatStatus('idle');
    } catch (error) {
      console.error('[openclaw] chat request failed', error);
      setChatStatus('error');
    }
  }, [activeAgent.id, chatInput, chatMessages, chatStatus]);

  return (
    <main className="app-shell">
      <Canvas
        gl={{ antialias: true }}
        camera={{
          position: CAMERA_START,
          fov: 33,
          near: 0.1,
          far: 500,
        }}
      >
        <Suspense fallback={null}>
          <Scene
            controlsRef={controlsRef}
            character={selectedCharacter}
            playerCharacterRef={playerCharacterRef}
            npcAgent={npcAgent}
            activeChatAgent={activeChatAgent}
            onRangeChange={setTargetNpcAgent}
            npcChatStatus={chatStatus}
            isChatting={isChatting}
          />
        </Suspense>
      </Canvas>

      <section className="hud">
        <div className="hud-picker">
          <label className="hud-picker-label" htmlFor="hud-character-picker">
            Character
          </label>
          <select
            id="hud-character-picker"
            className="hud-select"
            value={selectedCharacterId}
            onChange={(event) => {
              setSelectedCharacterId(event.target.value as CharacterId);
            }}
          >
            {CHARACTER_IDS.map((characterId) => (
              <option key={characterId} value={characterId}>
                {CHARACTER_DEFINITIONS[characterId].label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isChatting ? <div className="chat-backdrop" onClick={endChat} /> : null}

      <aside
        className={`chat-sidebar ${isChatting ? 'chat-sidebar-open' : ''} ${activeTab === 'context' ? 'chat-sidebar-context' : ''}`}
      >
        <div className="chat-sidebar-top">
          <p className="chat-sidebar-title">OpenClaw Chat - {activeAgent.name}</p>
          <p className="chat-sidebar-subtitle">Press Escape to close</p>
        </div>
        <div className="chat-tabs" role="tablist" aria-label="Chat sidebar tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`chat-tab-button ${activeTab === 'chat' ? 'chat-tab-button-active' : ''}`}
            onClick={() => {
              setActiveTab('chat');
            }}
          >
            Chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'context'}
            className={`chat-tab-button ${activeTab === 'context' ? 'chat-tab-button-active' : ''}`}
            onClick={() => {
              setActiveTab('context');
            }}
          >
            Context
          </button>
        </div>
        {activeTab === 'chat' ? (
          <>
            <div className="chat-log">
              {chatMessages.length === 0 ? (
                <p className="chat-empty">No messages yet.</p>
              ) : (
                chatMessages.map((entry, index) => (
                    <div key={index} className={'chat-entry chat-entry-' + entry.role}>
                    <span className="chat-role">
                      {entry.role === 'user' ? 'You' : activeAgent.name || activeAgent.id}
                    </span>
                    <p className="chat-text">{entry.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="chat-controls">
                <textarea
                ref={chatInputRef}
                className="chat-input"
                value={chatInput}
                placeholder={`Type a message to ${activeAgent.name}...`}
                onChange={(event) => {
                  setChatInput(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendToOpenClaw();
                  }
                }}
              />
              <button
                className="hud-button chat-send-button"
                type="button"
                disabled={chatStatus === 'loading' || !chatInput.trim()}
                onClick={() => {
                  void sendToOpenClaw();
                }}
              >
                {chatStatus === 'loading' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <div className="chat-context-layout">
            <div className="chat-context-file-row">
              {contextFileListState === 'loading' && availableContextFiles.length === 0 ? (
                <p className="chat-context-empty">Loading files...</p>
              ) : contextFileListState === 'error' ? (
                <p className="chat-context-empty">Failed to load context files.</p>
              ) : availableContextFiles.length === 0 ? (
                <p className="chat-context-empty">No markdown files found.</p>
              ) : (
                availableContextFiles.map((file) => (
                  <button
                    key={file}
                    type="button"
                    className={`chat-context-file ${selectedContextFile === file ? 'chat-context-file-active' : ''}`}
                    onClick={() => {
                      setSelectedContextFile(file);
                    }}
                  >
                    {file}
                  </button>
                ))
              )}
            </div>
            <div className="chat-context-reader">
              <pre className="chat-context-content">
                {contextLoadState === 'loading' && !contextContent ? 'Loading...' : contextContent || 'Select a file.'}
              </pre>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}

for (const characterId of CHARACTER_IDS) {
  const character = CHARACTER_DEFINITIONS[characterId];
  useGLTF.preload(character.modelUrl);
  for (const idleAnimationUrl of character.idleAnimationUrls) {
    useGLTF.preload(idleAnimationUrl);
  }
  useGLTF.preload(character.walkAnimationUrl);
  useGLTF.preload(character.runAnimationUrl);
  useGLTF.preload(character.jumpAnimationUrl);
}

export default App;
