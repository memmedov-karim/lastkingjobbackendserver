function isLinkValid(link) {
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(link);
}
function takeValidLinkFromData(data) {
    const filteredData = data.filter(link=>isLinkValid(link.url));
    return filteredData
}
function isLegalLink(link) {
    const bannedKeywords = ["porn", "xxx", "adult", "explicit", "nsfw", "nude", "sex", "xxx", "erotic", "hentai", "fetish", "vibrator", "escort", "bikini", "lingerie", "naked", "kamasutra", "condom", "orgy", "playboy", "vagina", "penis", "boobs", "breast", "nipples", "butt", "blowjob", "cum", "dildo", "masturbate", "striptease", "webcam", "anal", "bondage", "fetish","fuck","licking","orgasm","squirting"];
    const bannedPattern = new RegExp(bannedKeywords.join("|"), "i");
    const url = new URL(link);
    const domain = url.hostname;
    if (bannedPattern.test(domain) || bannedPattern.test(link)) {
      return false;
    } else {
      return true;
    }
} 
function takeOnlyIllegalLinkFromData(data) {
    const formatValidationsLinks = takeValidLinkFromData(data);
    const clearLinks = formatValidationsLinks.filter(link=>isLegalLink(link.url));
    return clearLinks
}





module.exports = {isLinkValid,takeValidLinkFromData,isLegalLink,takeOnlyIllegalLinkFromData}