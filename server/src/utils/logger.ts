export const log = (...args: any[]) => {
  // Simple logger wrapper — replace with Winston/Pino later
  // Keep minimal for student project
  // eslint-disable-next-line no-console
  console.log(new Date().toISOString(), '-', ...args);
};
