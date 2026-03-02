import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join, relative, resolve as resolvePath } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import type { PreviewServer, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

const openclawDir = join(homedir(), '.openclaw');

const resolveAgentWorkspacePath = (agentId: string) => {
  void agentId;
  return join(openclawDir, 'workspace');
};

const readAgentMarkdownFiles = async (agentId: string) => {
  const workspacePath = resolveAgentWorkspacePath(agentId);
  const dirEntries = await readdir(workspacePath, { withFileTypes: true });
  return dirEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

const readActiveAgents = async () => {
  const configPath = join(openclawDir, 'openclaw.json');
  const rawConfig = await readFile(configPath, 'utf8');
  const parsed = JSON.parse(rawConfig);
  const agentsList = (parsed as { agents?: { list?: unknown } }).agents?.list;

  if (!Array.isArray(agentsList)) {
    return [];
  }

  return agentsList
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as { id?: unknown; name?: unknown };
      const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
      const name = typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : id;

      if (!id) {
        return null;
      }

      return { id, name };
    })
    .filter((agent): agent is { id: string; name: string } => Boolean(agent))
    .sort((a, b) => a.id.localeCompare(b.id));
};

const readActiveAgentsSync = () => {
  const configPath = join(openclawDir, 'openclaw.json');
  const rawConfig = readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(rawConfig);
  const agentsList = (parsed as { agents?: { list?: unknown } }).agents?.list;

  if (!Array.isArray(agentsList)) {
    return [];
  }

  return agentsList
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as { id?: unknown; name?: unknown };
      const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
      const name = typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : id;

      if (!id) {
        return null;
      }

      return { id, name };
    })
    .filter((agent): agent is { id: string; name: string } => Boolean(agent))
    .sort((a, b) => a.id.localeCompare(b.id));
};

const writeJsonResponse = (res: ServerResponse, payload: unknown, statusCode = 200) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const writeErrorResponse = (res: ServerResponse, error: unknown, statusCode = 404) => {
  const message = error instanceof Error ? error.message : 'unknown error';
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: message }));
};

const normalizeRouteId = (routeUrl?: string) => {
  const raw = routeUrl?.replace(/^\//, '').split('?')[0] ?? '';
  try {
    return raw ? decodeURIComponent(raw) : '';
  } catch {
    return '';
  }
};

const normalizePathAndSegments = (routeUrl?: string) => {
  const route = routeUrl?.split('?')[0] ?? '';
  const trimmed = route.replace(/^\/+/, '').replace(/\/+$/, '');
  const [agentId, fileName] = trimmed.split('/');

  return {
    agentId: agentId ? normalizeRouteId(`/${agentId}`) : '',
    fileName: fileName ? normalizeRouteId(`/${fileName}`) : '',
  };
};

const readAgentFileContents = async (agentId: string, fileName: string) => {
  if (!agentId || !fileName) {
    throw new Error('agentId and fileName are required');
  }

  if (!fileName.toLowerCase().endsWith('.md')) {
    throw new Error('only .md files are supported');
  }

  if (fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
    throw new Error('invalid file path');
  }

  const workspacePath = resolveAgentWorkspacePath(agentId);
  const filePath = join(workspacePath, fileName);
  const relativePath = relative(workspacePath, filePath);
  if (relativePath.startsWith('..') || relativePath === '') {
    throw new Error('invalid file path');
  }

  return readFile(filePath, 'utf8');
};

const agentFsPlugin = () => ({
  name: 'agent-fs-plugin',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/agent-files', async (req: IncomingMessage, res: ServerResponse) => {
      const { agentId, fileName } = normalizePathAndSegments(req.url);
      if (!agentId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'agentId is required' }));
        return;
      }

      try {
        if (fileName) {
          const text = await readAgentFileContents(agentId, fileName);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(text);
          return;
        }

        const markdownFiles = await readAgentMarkdownFiles(agentId);
        writeJsonResponse(res, markdownFiles);
      } catch (error) {
        writeErrorResponse(res, error);
      }
    });

    server.middlewares.use('/api/openclaw-agents', async (req: IncomingMessage, res: ServerResponse) => {
      const routeSuffix = req.url?.split('?')[0] ?? '';
      if (routeSuffix !== '/') {
        writeErrorResponse(res, new Error('invalid endpoint'), 404);
        return;
      }

      try {
        const agents = await readActiveAgents();
        writeJsonResponse(res, agents);
      } catch (error) {
        writeErrorResponse(res, error, 500);
      }
    });

    server.middlewares.use('/api/local-agents', (req: IncomingMessage, res: ServerResponse) => {
      const routeSuffix = req.url?.split('?')[0] ?? '';
      if (routeSuffix !== '/') {
        writeErrorResponse(res, new Error('invalid endpoint'), 404);
        return;
      }

      try {
        const agents = readActiveAgentsSync();
        writeJsonResponse(res, agents);
      } catch (error) {
        writeErrorResponse(res, error, 500);
      }
    });
  },
  configurePreviewServer(server: PreviewServer) {
    server.middlewares.use('/api/agent-files', async (req: IncomingMessage, res: ServerResponse) => {
      const { agentId, fileName } = normalizePathAndSegments(req.url);
      if (!agentId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'agentId is required' }));
        return;
      }

      try {
        if (fileName) {
          const text = await readAgentFileContents(agentId, fileName);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(text);
          return;
        }

        const markdownFiles = await readAgentMarkdownFiles(agentId);
        writeJsonResponse(res, markdownFiles);
      } catch (error) {
        writeErrorResponse(res, error);
      }
    });

    server.middlewares.use('/api/openclaw-agents', async (req: IncomingMessage, res: ServerResponse) => {
      const routeSuffix = req.url?.split('?')[0] ?? '';
      if (routeSuffix !== '/') {
        writeErrorResponse(res, new Error('invalid endpoint'), 404);
        return;
      }

      try {
        const agents = await readActiveAgents();
        writeJsonResponse(res, agents);
      } catch (error) {
        writeErrorResponse(res, error, 500);
      }
    });

    server.middlewares.use('/api/local-agents', (req: IncomingMessage, res: ServerResponse) => {
      const routeSuffix = req.url?.split('?')[0] ?? '';
      if (routeSuffix !== '/') {
        writeErrorResponse(res, new Error('invalid endpoint'), 404);
        return;
      }

      try {
        const agents = readActiveAgentsSync();
        writeJsonResponse(res, agents);
      } catch (error) {
        writeErrorResponse(res, error, 500);
      }
    });
  },
});

const gammaProxy = {
  target: 'https://gamma-api.polymarket.com',
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/gamma-api/, ''),
};

const openClawProxy = {
  target: 'http://127.0.0.1:18789',
  changeOrigin: true,
  secure: false,
};

export default defineConfig({
  plugins: [agentFsPlugin(), react()],
  define: {
    'import.meta.env.VITE_OPENCLAW_DIR': JSON.stringify(openclawDir),
  },
  server: {
    fs: {
      allow: [resolvePath(__dirname, '.'), openclawDir],
    },
    proxy: {
      '/gamma-api': gammaProxy,
      '/v1': openClawProxy,
    },
  },
  preview: {
    proxy: {
      '/gamma-api': gammaProxy,
      '/v1': openClawProxy,
    },
  },
});
