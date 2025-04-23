import cron from 'node-cron';
import { updateMatches } from './update-matches';

// Schedule match updates to run every Monday at 2 AM
cron.schedule('0 2 * * 1', async () => {
  console.log('Running scheduled match update...');
  await updateMatches();
});

console.log('Scheduled updates started. Match updates will run every Monday at 2 AM.'); 