function formatTimeDifference(timestamp) {
    const now = new Date().getTime();
    const difference = now - timestamp.getTime();
    if (difference < 60 * 1000) {
      return `${Math.floor(difference / 1000)} seconds ago`;
    } else if (difference < 60 * 60 * 1000) {
      return `${Math.floor(difference / (60 * 1000))} minutes ago`;
    } else if (difference < 24 * 60 * 60 * 1000) {
      return `${Math.floor(difference / (60 * 60 * 1000))} hours ago`;
    }
    return timestamp
}

module.exports = {formatTimeDifference};