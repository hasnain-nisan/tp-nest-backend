import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();

export default async (req, res) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors();
  await app.init();

  return server(req, res);
};
