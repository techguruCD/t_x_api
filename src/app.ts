import compression from 'compression';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import env from './env';
import errorHandler from './middlewares/errorHandler.middleware';
import router from './routes/index.routes';

const app = express();

app.set('host', env().host);
app.set('port', env().port);
app.set('trust proxy', env().trustProxy);

app.use(morgan('dev'));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);
app.use(errorHandler);
export default app;
