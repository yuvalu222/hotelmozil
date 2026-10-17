// The closing slide of every deck (17.10). Owner: the last slide explains what
// the app is, not just "it saved me money". His own "Travel" folder screenshot
// with the old line taken out (closer-base.py), and the explanation written
// inside the folder in the same native text style as every other slide.
// Wording follows the public site (hotelmozil.com): same room, price by the
// place you book from, the booking opens through another region in the
// official app. No VPN/proxy/browser, no figure, no AI.
const L = (t, s) => ({ t, s, lh: 1.22 });
const gap = (h) => ({ t: '', h });

export const CLOSER = {
  photo: 'native/assets/closer-base.jpg',
  focus: [0.5, 0.5],
  width: 0.74,
  blocks: [{ top: 0.472, lines: [
    L('ככה זה עובד 👇', 'm'),
    gap(0.02),
    L('אותו חדר יכול לעלות אחרת', 's'),
    L('לפי המקום שממנו מזמינים', 's'),
    gap(0.02),
    L('מדביקים בה קישור למלון', 's'),
    L('וההזמנה נפתחת דרך אזור אחר', 's'),
    gap(0.02),
    L('חינם באפסטור ובגוגל פליי ❤️', 's'),
  ] }],
};
