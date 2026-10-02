import express from 'express';
import cors from 'cors';
import { PORT } from './config';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { log } from './utils/logger';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', router);

app.use(errorHandler as any);

app.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});
