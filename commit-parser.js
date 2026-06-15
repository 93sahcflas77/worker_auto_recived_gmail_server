module.exports = {
  parse(message) {
    message = message.trim();

    // CASE 1 — JIRA style: "JIRA-123 | feat | something"
    if (message.includes('|')) {
      const parts = message.split('|').map((p) => p.trim());

      return {
        scope: parts[0], // JIRA-123
        type: parts[1], // feat
        subject: parts[2], // add login
      };
    }

    // CASE 2 — Standard style: "feat: something"
    const match = message.match(/^(\w+):\s+(.*)$/);

    if (match) {
      return {
        type: match[1], // feat
        subject: match[2], // add login
      };
    }

    // If nothing matches, return raw (Commitlint will fail it)
    return {
      subject: message,
    };
  },
};
