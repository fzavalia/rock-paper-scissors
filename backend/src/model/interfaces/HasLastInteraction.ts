export default interface HasLastInteraction {
  lastInteraction: Date;
}

export const scheduleStaleElementsRemoval = (map: Map<string, HasLastInteraction>, name: string) => {
  const minutes = {
    60: 60 * 60 * 1000,
    30: 30 * 60 * 1000
  };
  setInterval(() => {
    console.log(`--- Deleting stale elements (${name})`);
    const now = +new Date();
    Array.from(map)
      .filter(([_, element]) => now - +element.lastInteraction > minutes[60])
      .forEach(([id, _]) => {
        map.delete(id);
        console.log(id);
      });
    console.log(`--- Finished deleting stale elements (${name})`);
  }, minutes[30]);
};
