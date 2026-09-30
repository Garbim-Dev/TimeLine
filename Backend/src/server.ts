import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { scheduleRouter } from './modules/schedules/schedule.routes';
import { managementRouter } from './modules/management/management.routes';
import { authRouter } from './modules/auth/auth.routes';
const app = express();

app.use(cors({
  origin: '*', // Permite que a Vercel acesse a API sem bloqueio
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/auth', authRouter);

// Rota de Health Check
app.get('/api/health', (_req, res) => {
  return res.json({ status: 'ok', service: 'Timeline Backend SENAI Parauapebas' });
});

// Rotas principais
app.use('/api/schedules', scheduleRouter);
app.use('/api/manage', managementRouter);

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor Timeline rodando na porta ${env.PORT}`);
  console.log(`🔗 Endpoint de testes: http://localhost:${env.PORT}/api/health`);
});