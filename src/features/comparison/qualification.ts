import type { WizardPreferences } from "./ranking";

export type QualificationPath = "plug_in" | "fixed_battery" | "both";

export interface QualificationResult {
  path: QualificationPath;
  plugInScore: number;
  fixedBatteryScore: number;
  reasons: string[];
}

/** Bepaalt of plug-in of vaste thuisbatterij (lead) het beste past. */
export function qualifyLeadPath(prefs: WizardPreferences): QualificationResult {
  let plugInScore = 50;
  let fixedBatteryScore = 0;
  const reasons: string[] = [];

  if (prefs.yearlyUsageKwh >= 3500) {
    fixedBatteryScore += 35;
    reasons.push("Hoog jaarverbruik, vaste thuisbatterij kan meer besparen");
  } else if (prefs.yearlyUsageKwh <= 2200) {
    plugInScore += 25;
    reasons.push("Gemiddeld tot laag verbruik, plug-in batterij is vaak voldoende");
  }

  if (prefs.hasHeatPump) {
    fixedBatteryScore += 30;
    reasons.push("Met warmtepomp past een grotere thuisbatterij beter");
  }

  if (prefs.hasEv) {
    fixedBatteryScore += 25;
    reasons.push("Elektrische auto vraagt om meer opslagcapaciteit");
  }

  if (prefs.solarKwp >= 6) {
    fixedBatteryScore += 20;
    reasons.push("Grote zonnepanelen-opstelling levert veel overschot op");
  } else if (prefs.hasSolar && prefs.solarKwp > 0 && prefs.solarKwp < 3) {
    plugInScore += 15;
    reasons.push("Compacte zonnepanelen-opstelling, balkonbatterij is ideaal");
  }

  if (prefs.budgetCents > 0 && prefs.budgetCents <= 120000) {
    plugInScore += 20;
  } else if (prefs.budgetCents === 0 || prefs.budgetCents > 180000) {
    fixedBatteryScore += 10;
  }

  if (prefs.wantExpandable) {
    plugInScore += 10;
  }

  let path: QualificationPath = "plug_in";
  if (fixedBatteryScore > plugInScore + 15) {
    path = "fixed_battery";
  } else if (fixedBatteryScore > plugInScore - 5 && fixedBatteryScore > 40) {
    path = "both";
  }

  return { path, plugInScore, fixedBatteryScore, reasons };
}
