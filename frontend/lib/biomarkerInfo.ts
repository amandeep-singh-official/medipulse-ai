/**
 * biomarkerInfo.ts
 * Static clinical knowledge dictionary for all biomarkers tracked by MediPulse AI.
 * Covers all 5 diagnostic panels: CBC, Lipid, Thyroid, Metabolic, LFT/KFT.
 * Lookup is normalised to lowercase so "TSH", "tsh", "Tsh" all resolve.
 */

export type BiomarkerInfo = {
  fullName: string      // Full clinical name
  description: string   // Plain-English explanation, 1–2 sentences
  significance: string  // What high / low values imply
  system: string        // Body system (e.g. "Endocrine")
  systemIcon: string    // Emoji icon for the system
}

const RAW: Record<string, BiomarkerInfo> = {

  // ── CBC — Complete Blood Count ──────────────────────────────────────

  'hemoglobin': {
    fullName: 'Hemoglobin',
    description: 'A protein in red blood cells that carries oxygen from your lungs to every cell in your body and returns carbon dioxide back to your lungs.',
    significance: '↑ High may indicate dehydration or polycythaemia. ↓ Low signals anaemia — causing fatigue, weakness, and shortness of breath.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'rbc': {
    fullName: 'Red Blood Cell Count',
    description: 'Measures the total number of red blood cells — the cells responsible for transporting oxygen throughout your body.',
    significance: '↑ High may indicate dehydration or bone marrow disorders. ↓ Low suggests anaemia or blood loss.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'rbc count': {
    fullName: 'Red Blood Cell Count',
    description: 'Measures the total number of red blood cells — the cells responsible for transporting oxygen throughout your body.',
    significance: '↑ High may indicate dehydration or bone marrow disorders. ↓ Low suggests anaemia or blood loss.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'wbc': {
    fullName: 'White Blood Cell Count',
    description: 'Counts the total number of immune cells in your blood. These cells are your body\'s primary defence against infections and foreign invaders.',
    significance: '↑ High often signals an active infection, inflammation, or stress response. ↓ Low may indicate a weakened immune system or bone marrow suppression.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'tlc': {
    fullName: 'Total Leukocyte Count (WBC)',
    description: 'Counts all white blood cells — your body\'s immune army that fights bacteria, viruses, and other pathogens.',
    significance: '↑ High = active infection or inflammation. ↓ Low = immune suppression or certain viral infections.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'tlc / wbc': {
    fullName: 'Total Leukocyte Count (WBC)',
    description: 'Counts all white blood cells — your body\'s immune army that fights bacteria, viruses, and other pathogens.',
    significance: '↑ High = active infection or inflammation. ↓ Low = immune suppression or certain viral infections.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'platelet count': {
    fullName: 'Platelet Count (Thrombocytes)',
    description: 'Platelets are tiny blood cells that clump together to form clots and stop bleeding when you\'re injured.',
    significance: '↑ High (thrombocytosis) raises clot risk. ↓ Low (thrombocytopenia) leads to excessive bleeding and bruising.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'platelets': {
    fullName: 'Platelet Count (Thrombocytes)',
    description: 'Platelets are tiny blood cells that clump together to form clots and stop bleeding when you\'re injured.',
    significance: '↑ High (thrombocytosis) raises clot risk. ↓ Low (thrombocytopenia) leads to excessive bleeding and bruising.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'hematocrit': {
    fullName: 'Hematocrit (PCV)',
    description: 'The percentage of your blood volume that is occupied by red blood cells. It directly reflects your blood\'s oxygen-carrying capacity.',
    significance: '↑ High = dehydration or polycythaemia. ↓ Low = anaemia, blood loss, or overhydration.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'mcv': {
    fullName: 'Mean Corpuscular Volume',
    description: 'Measures the average size of your red blood cells. It helps classify the type of anaemia if one is present.',
    significance: '↑ High (macrocytic) = B12/folate deficiency. ↓ Low (microcytic) = iron deficiency anaemia or thalassaemia.',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'mch': {
    fullName: 'Mean Corpuscular Haemoglobin',
    description: 'The average amount of haemoglobin contained within a single red blood cell. Helps characterise anaemia alongside MCV.',
    significance: '↑ High = macrocytic anaemia (B12/folate deficiency). ↓ Low = microcytic/hypochromic anaemia (iron deficiency).',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'mcv / mch': {
    fullName: 'MCV / MCH (Red Cell Indices)',
    description: 'MCV measures red cell size; MCH measures haemoglobin content per cell. Together they classify the type of anaemia.',
    significance: '↑ High = macrocytic anaemia. ↓ Low = microcytic anaemia (iron or B12 deficiency).',
    system: 'Haematology',
    systemIcon: '🩸',
  },
  'neutrophils': {
    fullName: 'Neutrophils',
    description: 'The most abundant white blood cell type — your immune system\'s first responders to bacterial infections and tissue injury.',
    significance: '↑ High = bacterial infection, inflammation, or physical stress. ↓ Low (neutropenia) = high infection vulnerability, seen in chemotherapy or viral illness.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'lymphocytes': {
    fullName: 'Lymphocytes',
    description: 'White blood cells that include T-cells and B-cells — responsible for your adaptive immune response, including fighting viruses and producing antibodies.',
    significance: '↑ High = viral infection (e.g. COVID-19, mono) or certain leukaemias. ↓ Low = immune suppression, HIV, or severe stress.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'eosinophils': {
    fullName: 'Eosinophils',
    description: 'White blood cells involved in combating parasitic infections and mediating allergic reactions and asthma responses.',
    significance: '↑ High (eosinophilia) = allergies, asthma, parasitic infection, or autoimmune conditions. ↓ Low = generally not clinically significant.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'basophils': {
    fullName: 'Basophils',
    description: 'The rarest white blood cell type, involved in allergic reactions and releasing histamine during immune responses.',
    significance: '↑ High = allergic reactions, inflammation, or certain blood disorders. ↓ Low = usually not clinically significant.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },
  'monocytes': {
    fullName: 'Monocytes',
    description: 'Large white blood cells that mature into macrophages — the "garbage collectors" of your immune system that engulf dead cells and pathogens.',
    significance: '↑ High = chronic infections (TB, viral), inflammatory conditions. ↓ Low = rare and usually not clinically concerning.',
    system: 'Immunology',
    systemIcon: '🛡️',
  },

  // ── Lipid & Cardiovascular Panel ────────────────────────────────────

  'total cholesterol': {
    fullName: 'Total Cholesterol',
    description: 'The combined measurement of all cholesterol types in your blood — including HDL (good), LDL (bad), and VLDL. Essential for cell function but dangerous in excess.',
    significance: '↑ High increases heart disease and stroke risk. ↓ Low may be linked to hormonal issues or malnutrition.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'hdl-c': {
    fullName: 'HDL Cholesterol (Good Cholesterol)',
    description: 'High-Density Lipoprotein carries excess cholesterol from your arteries back to the liver for disposal — actively protecting your heart.',
    significance: '↑ High = better heart protection. ↓ Low increases heart disease risk. Exercise and healthy fats raise HDL.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'hdl': {
    fullName: 'HDL Cholesterol (Good Cholesterol)',
    description: 'High-Density Lipoprotein carries excess cholesterol from your arteries back to the liver for disposal — actively protecting your heart.',
    significance: '↑ High = better heart protection. ↓ Low increases heart disease risk. Exercise and healthy fats raise HDL.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'ldl-c': {
    fullName: 'LDL Cholesterol (Bad Cholesterol)',
    description: 'Low-Density Lipoprotein deposits cholesterol in artery walls, forming plaques that narrow blood vessels and raise heart attack risk.',
    significance: '↑ High = higher risk of atherosclerosis, heart disease, and stroke. ↓ Low is generally desirable.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'ldl': {
    fullName: 'LDL Cholesterol (Bad Cholesterol)',
    description: 'Low-Density Lipoprotein deposits cholesterol in artery walls, forming plaques that narrow blood vessels and raise heart attack risk.',
    significance: '↑ High = higher risk of atherosclerosis, heart disease, and stroke. ↓ Low is generally desirable.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'triglycerides': {
    fullName: 'Triglycerides',
    description: 'The most common type of fat in your body, stored as energy. They rise sharply after eating sugary or fatty foods, and chronically elevated levels damage arteries.',
    significance: '↑ High = increased risk of pancreatitis, heart disease, metabolic syndrome. ↓ Low = generally not a concern.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'vldl-c': {
    fullName: 'VLDL Cholesterol',
    description: 'Very Low-Density Lipoprotein primarily carries triglycerides through the blood. It\'s a precursor to LDL and contributes to artery plaque.',
    significance: '↑ High = elevated triglycerides and cardiovascular risk. Typically high when triglycerides are high.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },
  'vldl': {
    fullName: 'VLDL Cholesterol',
    description: 'Very Low-Density Lipoprotein primarily carries triglycerides through the blood. It\'s a precursor to LDL and contributes to artery plaque.',
    significance: '↑ High = elevated triglycerides and cardiovascular risk.',
    system: 'Cardiovascular',
    systemIcon: '🫀',
  },

  // ── Thyroid Function Panel ───────────────────────────────────────────

  'tsh': {
    fullName: 'Thyroid Stimulating Hormone',
    description: 'A pituitary hormone that tells the thyroid gland how much hormone to produce. It\'s the master controller of thyroid function and metabolic rate.',
    significance: '↑ High = underactive thyroid (hypothyroidism) — fatigue, weight gain. ↓ Low = overactive thyroid (hyperthyroidism) — anxiety, weight loss, palpitations.',
    system: 'Endocrine',
    systemIcon: '🧬',
  },
  'free t3': {
    fullName: 'Free Triiodothyronine (Free T3)',
    description: 'The active, unbound form of T3 thyroid hormone. It directly regulates how fast your body\'s cells use energy — your metabolic speed dial.',
    significance: '↑ High = hyperthyroidism (racing metabolism). ↓ Low = hypothyroidism (sluggish metabolism, fatigue, cold intolerance).',
    system: 'Endocrine',
    systemIcon: '🧬',
  },
  'free t4': {
    fullName: 'Free Thyroxine (Free T4)',
    description: 'The unbound form of T4 — the main hormone produced by the thyroid. Your body converts T4 into the more active T3 in tissues.',
    significance: '↑ High = hyperthyroidism or excessive thyroid medication. ↓ Low = hypothyroidism or pituitary disease.',
    system: 'Endocrine',
    systemIcon: '🧬',
  },
  'total t3': {
    fullName: 'Total Triiodothyronine (Total T3)',
    description: 'Measures all T3 in the blood — both bound to proteins and free. T3 is the most potent thyroid hormone, directly driving cellular metabolism.',
    significance: '↑ High = hyperthyroidism or T3 toxicosis. ↓ Low = hypothyroidism, illness, or malnutrition.',
    system: 'Endocrine',
    systemIcon: '🧬',
  },
  'total t4': {
    fullName: 'Total Thyroxine (Total T4)',
    description: 'Measures all T4 thyroid hormone in the blood. T4 is the storage form of thyroid hormone, converted to active T3 by your body.',
    significance: '↑ High = hyperthyroidism or high thyroid-binding proteins. ↓ Low = hypothyroidism or protein deficiency.',
    system: 'Endocrine',
    systemIcon: '🧬',
  },
  'anti-tpo': {
    fullName: 'Anti-Thyroid Peroxidase Antibodies',
    description: 'Autoimmune antibodies that attack thyroid peroxidase — an enzyme essential for producing thyroid hormones. Their presence indicates autoimmune thyroid disease.',
    significance: '↑ High = Hashimoto\'s thyroiditis (most common cause of hypothyroidism) or Graves\' disease. ↓ Normal = no autoimmune thyroid attack.',
    system: 'Endocrine',
    systemIcon: '🧬',
  },

  // ── Metabolic & Glycemic Panel ───────────────────────────────────────

  'fasting glucose': {
    fullName: 'Fasting Blood Glucose (FBS)',
    description: 'Blood sugar level after at least 8 hours of fasting. It\'s the primary screening test for diabetes and insulin resistance.',
    significance: '↑ High = prediabetes or type 2 diabetes. ↓ Low (hypoglycaemia) = excessive insulin, missed meals, or medication side effect.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },
  'fasting blood sugar': {
    fullName: 'Fasting Blood Sugar',
    description: 'Blood sugar level measured after at least 8 hours without eating — the gold standard screening test for diabetes.',
    significance: '↑ High = prediabetes (100–125) or diabetes (≥126 mg/dL). ↓ Low = hypoglycaemia.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },
  'post-prandial': {
    fullName: 'Post-Prandial Blood Glucose (PPBS)',
    description: 'Blood glucose measured 2 hours after a meal. It reveals how efficiently your body clears sugar from the bloodstream after eating.',
    significance: '↑ High = impaired glucose tolerance or diabetes. ↓ Normal/low = healthy insulin response.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },
  'post-prandial glucose': {
    fullName: 'Post-Prandial Blood Glucose (PPBS)',
    description: 'Blood glucose measured 2 hours after a meal. It reveals how efficiently your body clears sugar from the bloodstream after eating.',
    significance: '↑ High = impaired glucose tolerance or diabetes. ↓ Normal/low = healthy insulin response.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },
  'hba1c': {
    fullName: 'Glycated Haemoglobin (HbA1c)',
    description: 'Shows your average blood sugar level over the past 2–3 months by measuring how much glucose has attached to haemoglobin. The definitive long-term diabetes monitor.',
    significance: '↑ High ≥ 6.5% = diabetes. 5.7–6.4% = prediabetes. ↓ Below 5.7% = normal glycaemic control.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },
  'fasting insulin': {
    fullName: 'Fasting Insulin',
    description: 'Measures the level of insulin in your blood after fasting. Used alongside fasting glucose to assess how hard your pancreas is working and detect insulin resistance.',
    significance: '↑ High = insulin resistance or hyperinsulinaemia (early type 2 diabetes pathway). ↓ Low = normal or type 1 diabetes.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },
  'homa-ir': {
    fullName: 'HOMA-IR (Insulin Resistance Index)',
    description: 'A calculated score (fasting insulin × fasting glucose ÷ 405) that quantifies how insulin-resistant your cells are. Higher values mean more resistance.',
    significance: '↑ High ≥ 2.0 = insulin resistance, metabolic syndrome risk. ↓ Low = good insulin sensitivity.',
    system: 'Metabolic',
    systemIcon: '🍬',
  },

  // ── LFT / KFT — Liver & Kidney Panel ────────────────────────────────

  'alt (sgpt)': {
    fullName: 'Alanine Aminotransferase (ALT / SGPT)',
    description: 'A liver enzyme that spills into the blood when liver cells are damaged or inflamed. The most specific marker of liver injury.',
    significance: '↑ High = liver damage from hepatitis, fatty liver, alcohol, or medication toxicity. ↓ Low = normal liver health.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
  'alt': {
    fullName: 'Alanine Aminotransferase (ALT)',
    description: 'A liver enzyme released when liver cells are damaged. The most specific blood marker for liver cell injury.',
    significance: '↑ High = liver injury (hepatitis, NAFLD, alcohol). ↓ Low = normal.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
  'sgpt': {
    fullName: 'SGPT (ALT — Liver Enzyme)',
    description: 'A liver enzyme that leaks into the blood when liver cells are damaged. Elevated SGPT is the hallmark of liver inflammation.',
    significance: '↑ High = liver damage (hepatitis, NAFLD, alcohol, drugs). ↓ Low = normal.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
  'ast (sgot)': {
    fullName: 'Aspartate Aminotransferase (AST / SGOT)',
    description: 'An enzyme found in the liver, heart, and muscles. Elevated AST can signal liver or cardiac muscle damage — less liver-specific than ALT.',
    significance: '↑ High = liver disease, heart attack, or muscle injury. ↓ Low = normal. ALT:AST ratio helps narrow diagnosis.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
  'ast': {
    fullName: 'Aspartate Aminotransferase (AST)',
    description: 'An enzyme found in the liver, heart, and muscles. Less specific than ALT for liver disease — elevated AST can also signal heart or muscle damage.',
    significance: '↑ High = liver damage, heart attack, or strenuous exercise. ↓ Low = normal.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
  'serum creatinine': {
    fullName: 'Serum Creatinine',
    description: 'A waste product from muscle metabolism, filtered out of the blood by healthy kidneys. When kidneys falter, creatinine accumulates.',
    significance: '↑ High = reduced kidney function, dehydration, or kidney disease. ↓ Low = reduced muscle mass (e.g. elderly, malnutrition).',
    system: 'Renal',
    systemIcon: '🫗',
  },
  'creatinine': {
    fullName: 'Serum Creatinine',
    description: 'A waste product from muscle metabolism, filtered out of the blood by healthy kidneys. When kidneys falter, creatinine accumulates.',
    significance: '↑ High = kidney dysfunction. ↓ Low = low muscle mass.',
    system: 'Renal',
    systemIcon: '🫗',
  },
  'bun': {
    fullName: 'Blood Urea Nitrogen (BUN)',
    description: 'Urea is a waste product from protein metabolism, cleared by your kidneys. BUN reflects how well your kidneys are filtering protein waste from the blood.',
    significance: '↑ High = kidney disease, dehydration, or high-protein diet. ↓ Low = malnutrition, liver disease, or overhydration.',
    system: 'Renal',
    systemIcon: '🫗',
  },
  'egfr': {
    fullName: 'Estimated Glomerular Filtration Rate',
    description: 'Estimates how much blood your kidneys filter per minute. It\'s the most accurate overall measure of kidney function and chronic kidney disease staging.',
    significance: '↑ High ≥ 90 = healthy kidney function. ↓ Low < 60 = chronic kidney disease. < 15 = kidney failure requiring dialysis.',
    system: 'Renal',
    systemIcon: '🫗',
  },
  'total bilirubin': {
    fullName: 'Total Bilirubin',
    description: 'A yellow pigment produced when red blood cells break down. Processed by the liver into bile — elevated levels cause jaundice (yellowing of skin/eyes).',
    significance: '↑ High = liver disease (hepatitis, cirrhosis), bile duct obstruction, or haemolytic anaemia. ↓ Low = generally not clinically significant.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
  'bilirubin': {
    fullName: 'Total Bilirubin',
    description: 'A yellow pigment from red blood cell breakdown — processed by the liver. High levels cause the yellowing of skin and eyes known as jaundice.',
    significance: '↑ High = liver dysfunction or bile duct blockage. ↓ Low = not clinically significant.',
    system: 'Hepatic',
    systemIcon: '🫘',
  },
}

/**
 * Look up biomarker info by name (case-insensitive).
 * Returns undefined if the biomarker is not in the dictionary.
 */
export function getBiomarkerInfo(name: string): BiomarkerInfo | undefined {
  return RAW[name.trim().toLowerCase()]
}

export default RAW
