import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { PhasesModule } from './phases/phases.module';
import { MatchdaysModule } from './matchdays/matchdays.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { PlayersModule } from './players/players.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { serverSetting } from './settings';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as express from 'express';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public-client'),
      serveRoot: '/', // Serve files from 'public' directory at '/'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/admin', // Serve files from 'admin' directory at '/admin'
    }),
    MongooseModule.forRoot(
      `mongodb+srv://matiDb:${process.env.DBPASSWORD}@dbprueba.twy3nho.mongodb.net/TestTournaments?retryWrites=true&w=majority&appName=DbPrueba`,
      // `mongodb+srv://matiDb:${process.env.DBPASSWORD}@dbprueba.twy3nho.mongodb.net/tournaments?retryWrites=true&w=majority&appName=DbPrueba`,
    ),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    MatchesModule,
    TournamentsModule,
    PhasesModule,
    MatchdaysModule,
    RegistrationsModule,
    PlayersModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
