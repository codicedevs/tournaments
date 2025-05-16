import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tournaments API (e2e)', () => {
  let app: INestApplication;
  let tournamentId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('creates a tournament', () => {
    return request(app.getHttpServer())
      .post('/tournaments')
      .send({ name: 'E2E Test Tournament' })
      .expect(201)
      .then((response) => {
        tournamentId = response.body._id;
        expect(response.body.name).toEqual('E2E Test Tournament');
      });
  });

  it('gets all tournaments', () => {
    return request(app.getHttpServer())
      .get('/tournaments')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
