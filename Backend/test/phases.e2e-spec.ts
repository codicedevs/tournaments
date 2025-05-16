import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PhaseType } from '../src/phases/entities/phase.entity';

describe('Phases API (e2e)', () => {
  let app: INestApplication;
  let tournamentId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a tournament first to use its ID for phase tests
    const tournamentResponse = await request(app.getHttpServer())
      .post('/tournaments')
      .send({ name: 'Test Tournament for Phases' });

    tournamentId = tournamentResponse.body._id;
  });

  it('creates a phase with type', () => {
    return request(app.getHttpServer())
      .post('/phases')
      .send({
        name: 'Group Phase',
        type: PhaseType.GROUP,
        tournamentId: tournamentId,
      })
      .expect(201)
      .then((response) => {
        expect(response.body.name).toEqual('Group Phase');
        expect(response.body.type).toEqual(PhaseType.GROUP);
      });
  });

  it('creates a phase with default type when type is not provided', () => {
    return request(app.getHttpServer())
      .post('/phases')
      .send({
        name: 'Unnamed Phase',
        tournamentId: tournamentId,
      })
      .expect(201)
      .then((response) => {
        expect(response.body.type).toEqual(PhaseType.GROUP); // Should use the default
      });
  });

  it('updates phase type', async () => {
    // Create a phase first
    const createResponse = await request(app.getHttpServer())
      .post('/phases')
      .send({
        name: 'Initial Phase',
        type: PhaseType.GROUP,
        tournamentId: tournamentId,
      });

    const phaseId = createResponse.body._id;

    // Update the phase type
    return request(app.getHttpServer())
      .patch(`/phases/${phaseId}`)
      .send({
        type: PhaseType.KNOCKOUT,
      })
      .expect(200)
      .then((response) => {
        expect(response.body.type).toEqual(PhaseType.KNOCKOUT);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
