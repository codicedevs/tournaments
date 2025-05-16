import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';

describe('Registrations API (e2e)', () => {
  let app: INestApplication;
  let tournamentId: string;
  let teamIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a tournament for testing
    const tournamentResponse = await request(app.getHttpServer())
      .post('/tournaments')
      .send({ name: 'Tournament for Registration Tests' });
    
    tournamentId = tournamentResponse.body._id;

    // Create multiple teams for testing
    const teamNames = ['Test Team 1', 'Test Team 2', 'Test Team 3'];
    for (const name of teamNames) {
      const teamResponse = await request(app.getHttpServer())
        .post('/teams')
        .send({ 
          name, 
          coach: `Coach for ${name}`,
          createdById: new Types.ObjectId().toString() 
        });
      teamIds.push(teamResponse.body._id);
    }
  });

  it('registers a team for a tournament', () => {
    return request(app.getHttpServer())
      .post('/registrations')
      .send({
        teamId: teamIds[0],
        tournamentId: tournamentId
      })
      .expect(201)
      .then(response => {
        expect(response.body.teamId.toString()).toEqual(teamIds[0]);
        expect(response.body.tournamentId.toString()).toEqual(tournamentId);
      });
  });

  it('retrieves all registrations for a tournament', async () => {
    // Register the remaining teams
    for (let i = 1; i < teamIds.length; i++) {
      await request(app.getHttpServer())
        .post('/registrations')
        .send({
          teamId: teamIds[i],
          tournamentId: tournamentId
        });
    }

    // Retrieve registrations for the tournament
    return request(app.getHttpServer())
      .get(`/registrations/tournament/${tournamentId}`)
      .expect(200)
      .then(response => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toEqual(teamIds.length);
        
        // Check that each team ID is in the response
        const retrievedTeamIds = response.body.map(reg => reg.teamId._id);
        for (const teamId of teamIds) {
          expect(retrievedTeamIds).toContain(teamId);
        }
      });
  });

  it('prevents duplicate team registrations', async () => {
    return request(app.getHttpServer())
      .post('/registrations')
      .send({
        teamId: teamIds[0],  // This team is already registered
        tournamentId: tournamentId
      })
      .expect(409); // Conflict status code
  });

  it('retrieves teams for a tournament via the registrations endpoint', () => {
    return request(app.getHttpServer())
      .get(`/registrations/tournament/${tournamentId}`)
      .expect(200)
      .then(response => {
        const teams = response.body.map(reg => reg.teamId);
        expect(teams.length).toBe(teamIds.length);
        expect(teams[0]).toHaveProperty('name');
        expect(teams[0]).toHaveProperty('coach');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
