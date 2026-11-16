import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  parseCookie
} from './src/db/auth.ts';
import {
  getBootstrapData,
  getUserProfileById,
  registerUserRecord,
  loginUserRecord,
  createCourtRecord,
  updateCourtRecord,
  toggleBlockedSlotRecord,
  createTeamRecord,
  updateTeamRecord,
  addTeamMemberRecord,
  removeTeamMemberRecord,
  updateTeamMemberRoleRecord,
  createChallengeAndBookingRecord,
  acceptChallengeRecord,
  updateBookingStatusRecord
} from './src/db/repository.ts';

dotenv.config();

const PORT = 3000;

function getSessionFromReq(req: express.Request) {
  const cookieToken = parseCookie(req.headers.cookie, SESSION_COOKIE_NAME);
  if (cookieToken) {
    const verified = verifySessionToken(cookieToken);
    if (verified) return verified;
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return verifySessionToken(authHeader.slice(7));
  }
  return null;
}

function setSessionCookie(res: express.Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

function formatDbError(error: unknown, fallbackMessage: string) {
  const err = error as Error & {
    code?: string;
    statusCode?: number;
    cause?: Error & { code?: string; cause?: { code?: string } };
  };
  if (err?.statusCode) {
    return { status: err.statusCode, message: err.message };
  }
  const code = err?.code || err?.cause?.code || err?.cause?.cause?.code || '';
  const combinedMsg = `${err?.message || ''} ${err?.cause?.message || ''}`;

  if (code === 'ER_NO_SUCH_TABLE') {
    return {
      status: 503,
      message: 'Tabelas do MySQL não encontradas. Execute "npm run db:migrate" para aplicar as migrations.'
    };
  }

  if (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ER_ACCESS_DENIED_ERROR' ||
    code === 'ER_BAD_DB_ERROR' ||
    code === 'ETIMEDOUT' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    combinedMsg.includes('ECONNREFUSED') ||
    combinedMsg.includes('ETIMEDOUT')
  ) {
    return {
      status: 503,
      message:
        'MySQL não conectado. Verifique as credenciais no .env, inicie o MySQL local e execute "npm run db:migrate".'
    };
  }
  return { status: 500, message: err?.message || fallbackMessage };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // AUTHENTICATION ROUTES (100% MySQL)
  // ==========================================
  app.get('/api/auth/me', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.json({ user: null });
      }
      const user = await getUserProfileById(session.userId);
      if (!user) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        return res.json({ user: null });
      }
      res.json({ user });
    } catch (error) {
      console.error('Auth me error:', error);
      const { status, message } = formatDbError(error, 'Erro ao validar sessão no MySQL.');
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, phone, role, teamName, modality, skillLevel, city, homeCourtId, arenaName } =
        req.body;

      if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
        return res
          .status(400)
          .json({ error: 'Preencha nome, e-mail válido e senha com pelo menos 6 caracteres.' });
      }

      if (role !== 'CAPITAO' && role !== 'GESTOR') {
        return res.status(400).json({ error: 'Perfil de administrador inválido.' });
      }

      const { user, createdTeam } = await registerUserRecord({
        name,
        email,
        password,
        phone: phone || '',
        role,
        teamName,
        modality,
        skillLevel,
        city,
        homeCourtId,
        arenaName
      });

      const token = createSessionToken(user.id, user.role);
      setSessionCookie(res, token);
      res.status(201).json({ user, createdTeam });
    } catch (error) {
      console.error('Register error:', error);
      const { status, message } = formatDbError(error, 'Erro ao cadastrar conta no MySQL.');
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email?.trim() || !password) {
        return res.status(400).json({ error: 'Informe e-mail e senha.' });
      }

      const user = await loginUserRecord(email, password);
      if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      const token = createSessionToken(user.id, user.role);
      setSessionCookie(res, token);
      res.json({ user });
    } catch (error) {
      console.error('Login error:', error);
      const { status, message } = formatDbError(error, 'Erro ao autenticar no MySQL.');
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  // ==========================================
  // BOOTSTRAP DATA (100% MySQL)
  // ==========================================
  app.get('/api/bootstrap', async (_req, res) => {
    try {
      const data = await getBootstrapData();
      res.json(data);
    } catch (error) {
      console.error('Bootstrap error:', error);
      const { status, message } = formatDbError(error, 'Falha ao carregar dados do MySQL.');
      res.status(status).json({ error: message });
    }
  });

  // ==========================================
  // COURTS (Admin da Quadra)
  // ==========================================
  app.post('/api/courts', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login no MySQL para cadastrar uma quadra.' });
      }
      const created = await createCourtRecord(req.body);
      res.status(201).json(created);
    } catch (error) {
      console.error('Create court error:', error);
      const { status, message } = formatDbError(error, 'Erro ao cadastrar quadra.');
      res.status(status).json({ error: message });
    }
  });

  app.patch('/api/courts/:id', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para editar a quadra.' });
      }
      const result = await updateCourtRecord(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Update court error:', error);
      const { status, message } = formatDbError(error, 'Erro ao atualizar quadra.');
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/courts/:id/block-slot', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para alterar horários da quadra.' });
      }
      const { date, timeSlot } = req.body;
      const result = await toggleBlockedSlotRecord(req.params.id, date, timeSlot);
      res.json(result);
    } catch (error) {
      console.error('Toggle block slot error:', error);
      const { status, message } = formatDbError(error, 'Erro ao bloquear horário.');
      res.status(status).json({ error: message });
    }
  });

  // ==========================================
  // TEAMS & MEMBERS (Admin do Time)
  // ==========================================
  app.post('/api/teams', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para cadastrar um time.' });
      }
      const created = await createTeamRecord(req.body, session.userId);
      res.status(201).json(created);
    } catch (error) {
      console.error('Create team error:', error);
      const { status, message } = formatDbError(error, 'Erro ao cadastrar time.');
      res.status(status).json({ error: message });
    }
  });

  app.patch('/api/teams/:id', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para atualizar o time.' });
      }
      const result = await updateTeamRecord(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Update team error:', error);
      const { status, message } = formatDbError(error, 'Erro ao atualizar time.');
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/teams/:id/members', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para adicionar jogadores.' });
      }
      const created = await addTeamMemberRecord(req.params.id, req.body);
      res.status(201).json(created);
    } catch (error) {
      console.error('Add member error:', error);
      const { status, message } = formatDbError(error, 'Erro ao adicionar jogador.');
      res.status(status).json({ error: message });
    }
  });

  app.delete('/api/teams/:id/members/:memberId', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para remover jogadores.' });
      }
      const result = await removeTeamMemberRecord(req.params.id, req.params.memberId);
      res.json(result);
    } catch (error) {
      console.error('Remove member error:', error);
      const { status, message } = formatDbError(error, 'Erro ao remover jogador.');
      res.status(status).json({ error: message });
    }
  });

  app.patch('/api/teams/:id/members/:memberId/role', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para alterar permissões.' });
      }
      const { role } = req.body;
      const result = await updateTeamMemberRoleRecord(req.params.id, req.params.memberId, role);
      res.json(result);
    } catch (error) {
      console.error('Update member role error:', error);
      const { status, message } = formatDbError(error, 'Erro ao atualizar permissão.');
      res.status(status).json({ error: message });
    }
  });

  // ==========================================
  // CHALLENGES & BOOKINGS
  // ==========================================
  app.post('/api/challenges', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para marcar jogos ou publicar desafios.' });
      }
      const { challenge, booking } = req.body;
      const result = await createChallengeAndBookingRecord(challenge, booking);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create challenge error:', error);
      const { status, message } = formatDbError(error, 'Erro ao criar desafio.');
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/challenges/:id/accept', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para aceitar desafios.' });
      }
      const { acceptingTeam, fallbackBooking } = req.body;
      const result = await acceptChallengeRecord(req.params.id, acceptingTeam, fallbackBooking);
      res.json(result);
    } catch (error) {
      console.error('Accept challenge error:', error);
      const { status, message } = formatDbError(error, 'Erro ao aceitar desafio.');
      res.status(status).json({ error: message });
    }
  });

  app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
      const session = getSessionFromReq(req);
      if (!session) {
        return res.status(401).json({ error: 'Faça login para atualizar reservas.' });
      }
      const { status } = req.body;
      const result = await updateBookingStatusRecord(req.params.id, status);
      res.json(result);
    } catch (error) {
      console.error('Update booking status error:', error);
      const { status, message } = formatDbError(error, 'Erro ao atualizar reserva.');
      res.status(status).json({ error: message });
    }
  });

  // Vite middleware in dev, static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MatchQuadra server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
