/**
 * Synthetic FIR Case Dataset Generator
 * 
 * IMPORTANT NOTICE:
 * This script generates SYNTHETIC case data for academic and research purposes only.
 * All data is artificially created and does not represent real FIRs, crimes, or individuals.
 * 
 * Use Case: Academic projects, research, system testing, and demonstration purposes.
 * 
 * Ethical Compliance:
 * - No real personal information used
 * - All names, locations, and case details are fictional
 * - Clearly marked as synthetic data
 * - Suitable for final-year projects and research presentations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Case } from '../models/Case.js';
import { generateEmbedding } from '../services/embeddingService.js';

dotenv.config();

// Synthetic crime scenarios for Indian context
const CRIME_TEMPLATES = [
  // Theft cases
  {
    title: 'Mobile Phone Theft',
    descriptions: [
      'Mobile phone and wallet stolen from victim near metro station during evening rush hour',
      'Smartphone snatched from pedestrian while walking on busy street',
      'Mobile phone theft from victim at crowded market area',
      'Cell phone stolen from person waiting at bus stop',
      'Mobile phone pickpocketed from commuter in public transport'
    ],
    ipcSections: [['IPC 379'], ['IPC 379', 'IPC 356'], ['IPC 379', 'IPC 411']],
    locations: [
      'Sector 14 Metro Station, Delhi',
      'Connaught Place, New Delhi',
      'Lajpat Nagar Market, Delhi',
      'Karol Bagh, Delhi',
      'Rajiv Chowk, Delhi'
    ]
  },
  {
    title: 'Chain Snatching',
    descriptions: [
      'Gold chain snatched from elderly woman near bus stop in broad daylight',
      'Chain snatching incident involving two-wheeler riders',
      'Gold necklace snatched from victim while walking on street',
      'Chain snatching case reported near residential area',
      'Ornament theft via snatching from pedestrian'
    ],
    ipcSections: [['IPC 379'], ['IPC 379', 'IPC 323'], ['IPC 379', 'IPC 356']],
    locations: [
      'Sector 12 Bus Stand, Delhi',
      'Dwarka Sector 10, Delhi',
      'Rohini Sector 8, Delhi',
      'Pitampura, Delhi',
      'Janakpuri, Delhi'
    ]
  },
  {
    title: 'Vehicle Theft',
    descriptions: [
      'Two-wheeler stolen from parking area outside residential complex',
      'Motorcycle theft reported from public parking space',
      'Bicycle stolen from outside shop',
      'Scooter theft from apartment building parking',
      'Vehicle theft from commercial area'
    ],
    ipcSections: [['IPC 379'], ['IPC 379', 'IPC 411'], ['IPC 379', 'IPC 34']],
    locations: [
      'Sector 15 Residential Complex, Delhi',
      'Gurgaon Sector 23',
      'Noida Sector 62',
      'Faridabad Sector 31',
      'Ghaziabad Sector 3'
    ]
  },
  {
    title: 'Shoplifting',
    descriptions: [
      'Multiple items stolen from electronics store by organized group',
      'Shoplifting incident at clothing store caught on CCTV',
      'Goods stolen from supermarket by multiple accused',
      'Shoplifting case involving theft of high-value items',
      'Retail theft from departmental store'
    ],
    ipcSections: [['IPC 379'], ['IPC 379', 'IPC 34'], ['IPC 379', 'IPC 120B']],
    locations: [
      'City Mall, Sector 18, Noida',
      'Select Citywalk, Saket, Delhi',
      'Ambience Mall, Gurgaon',
      'DLF Mall, Vasant Kunj, Delhi',
      'Pacific Mall, Ghaziabad'
    ]
  },
  {
    title: 'ATM Fraud',
    descriptions: [
      'Cash withdrawal fraud using cloned ATM card',
      'Unauthorized transactions from bank account via ATM',
      'ATM card skimming and PIN theft case',
      'Fraudulent cash withdrawal from victim account',
      'ATM transaction fraud involving card duplication'
    ],
    ipcSections: [['IPC 420'], ['IPC 420', 'IPC 379'], ['IPC 420', 'IPC 468']],
    locations: [
      'Sector 15 ATM Center, Delhi',
      'Connaught Place ATM, New Delhi',
      'Dwarka Sector 10 ATM, Delhi',
      'Gurgaon Sector 29 ATM',
      'Noida Sector 18 ATM'
    ]
  },
  // Assault cases
  {
    title: 'Assault and Battery',
    descriptions: [
      'Physical assault resulting in minor injuries during altercation',
      'Assault case involving dispute between neighbors',
      'Battery incident at public place during argument',
      'Physical assault reported after verbal altercation',
      'Assault case involving multiple persons'
    ],
    ipcSections: [['IPC 323'], ['IPC 323', 'IPC 34'], ['IPC 325']],
    locations: [
      'Sector 20 Market, Noida',
      'Dwarka Sector 12, Delhi',
      'Rohini Sector 15, Delhi',
      'Pitampura Market, Delhi',
      'Janakpuri District Center, Delhi'
    ]
  },
  {
    title: 'Robbery',
    descriptions: [
      'Armed robbery at commercial establishment',
      'Robbery case involving threat and theft of valuables',
      'Daylight robbery incident at shop',
      'Robbery with weapon used to threaten victim',
      'Robbery case involving multiple accused'
    ],
    ipcSections: [['IPC 392'], ['IPC 392', 'IPC 34'], ['IPC 394']],
    locations: [
      'Sector 18 Market, Noida',
      'Karol Bagh Market, Delhi',
      'Lajpat Nagar, Delhi',
      'Gurgaon Sector 29 Market',
      'Faridabad Sector 21 Market'
    ]
  },
  // Cybercrime
  {
    title: 'Online Fraud',
    descriptions: [
      'Online payment fraud through phishing website',
      'Fraudulent online transaction using stolen credentials',
      'E-commerce fraud case involving fake seller',
      'Online banking fraud through social engineering',
      'Digital payment fraud using compromised account'
    ],
    ipcSections: [['IPC 420'], ['IPC 420', 'IPC 468'], ['IPC 420', 'IPC 66C']],
    locations: [
      'Online - Delhi',
      'Cyber Crime - NCR',
      'Digital Fraud - Delhi',
      'Online Transaction - Noida',
      'E-Commerce Fraud - Gurgaon'
    ]
  },
  {
    title: 'Cheating and Fraud',
    descriptions: [
      'Financial fraud through false promises and misrepresentation',
      'Cheating case involving property transaction',
      'Fraudulent scheme leading to financial loss',
      'Cheating by personation in commercial transaction',
      'Financial fraud through deceptive practices'
    ],
    ipcSections: [['IPC 420'], ['IPC 420', 'IPC 120B'], ['IPC 468']],
    locations: [
      'Sector 63, Noida',
      'Dwarka Sector 6, Delhi',
      'Gurgaon Sector 40',
      'Rohini Sector 24, Delhi',
      'Faridabad Sector 16'
    ]
  },
  // Property crimes
  {
    title: 'Burglary',
    descriptions: [
      'Residential burglary with forced entry',
      'Break-in and theft from commercial property',
      'Burglary case involving theft of valuables',
      'Forced entry theft from locked premises',
      'Burglary incident at residential apartment'
    ],
    ipcSections: [['IPC 454'], ['IPC 454', 'IPC 379'], ['IPC 457']],
    locations: [
      'Sector 22 Residential Area, Noida',
      'Dwarka Sector 7, Delhi',
      'Rohini Sector 16, Delhi',
      'Pitampura Residential Complex, Delhi',
      'Gurgaon Sector 45'
    ]
  },
  // Domestic violence
  {
    title: 'Domestic Violence',
    descriptions: [
      'Domestic violence case involving physical abuse',
      'Spousal abuse reported by victim',
      'Domestic dispute leading to physical assault',
      'Family violence case with injury to victim',
      'Domestic abuse involving threats and physical harm'
    ],
    ipcSections: [['IPC 498A'], ['IPC 323'], ['IPC 498A', 'IPC 506']],
    locations: [
      'Sector 19 Residential Area, Noida',
      'Dwarka Sector 8, Delhi',
      'Rohini Sector 17, Delhi',
      'Pitampura, Delhi',
      'Gurgaon Sector 46'
    ]
  },
  // Cyber crimes
  {
    title: 'Cyber Stalking',
    descriptions: [
      'Online harassment and stalking through social media',
      'Cyber stalking case involving repeated threats',
      'Digital harassment and online intimidation',
      'Social media stalking and abuse',
      'Online stalking with threats to victim'
    ],
    ipcSections: [['IPC 354D'], ['IPC 354D', 'IPC 506'], ['IPC 66E']],
    locations: [
      'Cyber Crime Unit - Delhi',
      'Online Harassment - NCR',
      'Digital Crime - Delhi',
      'Social Media Crime - Noida',
      'Cyber Stalking - Gurgaon'
    ]
  },
  {
    title: 'Identity Theft',
    descriptions: [
      'Identity theft using stolen personal documents',
      'Fraudulent use of victim identity for financial gain',
      'Identity theft case involving forged documents',
      'Personal information theft and misuse',
      'Identity fraud using stolen Aadhaar details'
    ],
    ipcSections: [['IPC 419'], ['IPC 420', 'IPC 468'], ['IPC 471']],
    locations: [
      'Sector 16, Noida',
      'Dwarka Sector 9, Delhi',
      'Rohini Sector 18, Delhi',
      'Gurgaon Sector 47',
      'Faridabad Sector 17'
    ]
  },
  // Drug-related crimes
  {
    title: 'Drug Possession',
    descriptions: [
      'Illegal drug possession case',
      'Narcotics found in possession of accused',
      'Drug possession during police raid',
      'Illegal substance possession case',
      'Controlled substance found with accused'
    ],
    ipcSections: [['NDPS Act'], ['NDPS Act', 'IPC 34']],
    locations: [
      'Sector 21, Noida',
      'Dwarka Sector 10, Delhi',
      'Rohini Sector 19, Delhi',
      'Gurgaon Sector 48',
      'Faridabad Sector 18'
    ]
  },
  // Forgery
  {
    title: 'Document Forgery',
    descriptions: [
      'Forgery of official documents for fraudulent purposes',
      'Fake certificate and document forgery case',
      'Forged documents used for property transaction',
      'Document forgery involving government papers',
      'Forgery case with multiple fake documents'
    ],
    ipcSections: [['IPC 465'], ['IPC 468'], ['IPC 471']],
    locations: [
      'Sector 17, Noida',
      'Dwarka Sector 11, Delhi',
      'Rohini Sector 20, Delhi',
      'Gurgaon Sector 49',
      'Faridabad Sector 19'
    ]
  },
  // Extortion
  {
    title: 'Extortion',
    descriptions: [
      'Extortion case involving threats for money',
      'Blackmail and extortion of victim',
      'Extortion with threats to victim family',
      'Money extortion through intimidation',
      'Extortion case involving business owner'
    ],
    ipcSections: [['IPC 384'], ['IPC 384', 'IPC 506'], ['IPC 387']],
    locations: [
      'Sector 18, Noida',
      'Dwarka Sector 12, Delhi',
      'Rohini Sector 21, Delhi',
      'Gurgaon Sector 50',
      'Faridabad Sector 20'
    ]
  },
  // Kidnapping
  {
    title: 'Kidnapping',
    descriptions: [
      'Kidnapping case for ransom demand',
      'Abduction of victim for illegal purpose',
      'Kidnapping incident involving minor',
      'Forced abduction and illegal confinement',
      'Kidnapping case with ransom threat'
    ],
    ipcSections: [['IPC 363'], ['IPC 365'], ['IPC 364A']],
    locations: [
      'Sector 19, Noida',
      'Dwarka Sector 13, Delhi',
      'Rohini Sector 22, Delhi',
      'Gurgaon Sector 51',
      'Faridabad Sector 21'
    ]
  },
  // Sexual harassment
  {
    title: 'Sexual Harassment',
    descriptions: [
      'Sexual harassment case at workplace',
      'Inappropriate behavior and sexual advances',
      'Sexual harassment in public place',
      'Workplace harassment involving inappropriate conduct',
      'Sexual harassment case with verbal abuse'
    ],
    ipcSections: [['IPC 354A'], ['IPC 509'], ['IPC 354']],
    locations: [
      'Sector 20, Noida',
      'Dwarka Sector 14, Delhi',
      'Rohini Sector 23, Delhi',
      'Gurgaon Sector 52',
      'Faridabad Sector 22'
    ]
  },
  // Public nuisance
  {
    title: 'Public Nuisance',
    descriptions: [
      'Public nuisance case involving loud noise',
      'Disturbance of public peace and tranquility',
      'Public nuisance with illegal activities',
      'Noise pollution and public disturbance',
      'Public nuisance affecting neighborhood'
    ],
    ipcSections: [['IPC 268'], ['IPC 290'], ['IPC 291']],
    locations: [
      'Sector 21, Noida',
      'Dwarka Sector 15, Delhi',
      'Rohini Sector 24, Delhi',
      'Gurgaon Sector 53',
      'Faridabad Sector 23'
    ]
  },
  // Trespassing
  {
    title: 'Criminal Trespass',
    descriptions: [
      'Unauthorized entry into private property',
      'Criminal trespass with intent to commit offense',
      'Trespassing case at residential property',
      'Illegal entry into commercial premises',
      'Criminal trespass with malicious intent'
    ],
    ipcSections: [['IPC 447'], ['IPC 448'], ['IPC 451']],
    locations: [
      'Sector 22, Noida',
      'Dwarka Sector 16, Delhi',
      'Rohini Sector 25, Delhi',
      'Gurgaon Sector 54',
      'Faridabad Sector 24'
    ]
  },
  // Mischief
  {
    title: 'Criminal Mischief',
    descriptions: [
      'Property damage through criminal mischief',
      'Vandalism and destruction of property',
      'Criminal mischief causing financial loss',
      'Intentional damage to public property',
      'Mischief case involving vehicle damage'
    ],
    ipcSections: [['IPC 426'], ['IPC 427'], ['IPC 435']],
    locations: [
      'Sector 23, Noida',
      'Dwarka Sector 17, Delhi',
      'Rohini Sector 26, Delhi',
      'Gurgaon Sector 55',
      'Faridabad Sector 25'
    ]
  },
  // Defamation
  {
    title: 'Defamation',
    descriptions: [
      'Defamation case involving false statements',
      'Character defamation through social media',
      'Defamatory statements causing reputation damage',
      'False allegations leading to defamation',
      'Defamation case with malicious intent'
    ],
    ipcSections: [['IPC 499'], ['IPC 500'], ['IPC 501']],
    locations: [
      'Sector 24, Noida',
      'Dwarka Sector 18, Delhi',
      'Rohini Sector 27, Delhi',
      'Gurgaon Sector 56',
      'Faridabad Sector 26'
    ]
  },
  // Cheating by personation
  {
    title: 'Cheating by Personation',
    descriptions: [
      'Impersonation for fraudulent purposes',
      'Cheating by personation in official matters',
      'False identity used to cheat victim',
      'Personation case involving fake credentials',
      'Cheating through impersonation of official'
    ],
    ipcSections: [['IPC 419'], ['IPC 420'], ['IPC 468']],
    locations: [
      'Sector 25, Noida',
      'Dwarka Sector 19, Delhi',
      'Rohini Sector 28, Delhi',
      'Gurgaon Sector 57',
      'Faridabad Sector 27'
    ]
  },
  // Criminal breach of trust
  {
    title: 'Criminal Breach of Trust',
    descriptions: [
      'Breach of trust involving entrusted property',
      'Misappropriation of funds by trusted person',
      'Criminal breach of trust in business transaction',
      'Trust violation with financial misappropriation',
      'Breach of trust case involving property'
    ],
    ipcSections: [['IPC 406'], ['IPC 409'], ['IPC 420']],
    locations: [
      'Sector 26, Noida',
      'Dwarka Sector 20, Delhi',
      'Rohini Sector 29, Delhi',
      'Gurgaon Sector 58',
      'Faridabad Sector 28'
    ]
  },
  // Unlawful assembly
  {
    title: 'Unlawful Assembly',
    descriptions: [
      'Unlawful assembly causing public disturbance',
      'Rioting and unlawful assembly case',
      'Public disorder due to unlawful gathering',
      'Unlawful assembly with intent to commit crime',
      'Rioting case involving multiple accused'
    ],
    ipcSections: [['IPC 143'], ['IPC 147'], ['IPC 148']],
    locations: [
      'Sector 27, Noida',
      'Dwarka Sector 21, Delhi',
      'Rohini Sector 30, Delhi',
      'Gurgaon Sector 59',
      'Faridabad Sector 29'
    ]
  },
  // Criminal intimidation
  {
    title: 'Criminal Intimidation',
    descriptions: [
      'Threats and criminal intimidation of victim',
      'Intimidation case with threats to life',
      'Criminal intimidation for extortion',
      'Threats causing fear and intimidation',
      'Intimidation case involving threats to family'
    ],
    ipcSections: [['IPC 506'], ['IPC 506', 'IPC 34'], ['IPC 507']],
    locations: [
      'Sector 28, Noida',
      'Dwarka Sector 22, Delhi',
      'Rohini Sector 31, Delhi',
      'Gurgaon Sector 60',
      'Faridabad Sector 30'
    ]
  }
];

const OFFICER_NAMES = [
  'Inspector Rajesh Kumar',
  'Sub-Inspector Priya Sharma',
  'Inspector Anil Verma',
  'Sub-Inspector Mehta',
  'Inspector Vikram Singh',
  'Sub-Inspector Anjali Patel',
  'Inspector Rohit Gupta',
  'Sub-Inspector Sneha Reddy',
  'Inspector Amit Kumar',
  'Sub-Inspector Kavita Nair'
];

const STATUSES = ['Closed', 'Investigating', 'Pending'];

/**
 * Generate a random date within the past 2 years
 */
function generateRandomDate() {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  const date = new Date(randomTime);
  return date.toISOString().split('T')[0];
}

/**
 * Generate synthetic FIR number
 */
function generateFIRNumber(index) {
  const year = 2022 + Math.floor(Math.random() * 3); // 2022, 2023, or 2024
  const serial = String(100000 + index).padStart(6, '0');
  return `SYN/${year}/${serial}`; // SYN prefix to indicate synthetic
}

/**
 * Generate a single synthetic case
 */
function generateSyntheticCase(template, index) {
  const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
  const ipcSections = template.ipcSections[Math.floor(Math.random() * template.ipcSections.length)];
  const location = template.locations[Math.floor(Math.random() * template.locations.length)];
  const officer = OFFICER_NAMES[Math.floor(Math.random() * OFFICER_NAMES.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const date = generateRandomDate();
  
  const firId = `SYN_CASE_${index}`;
  const firNumber = generateFIRNumber(index);
  
  return {
    firId,
    firNumber,
    title: `${template.title} - ${location.split(',')[0]}`,
    description,
    ipcSections,
    location,
    date,
    officer,
    status,
    isSynthetic: true
  };
}

/**
 * Main function to generate and seed synthetic cases
 */
async function generateSyntheticCases(count = 150) {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { dbName: 'smart_fir' });
    console.log('✅ Connected to MongoDB');

    // Clear existing synthetic cases (optional - comment out to append)
    const deletedCount = await Case.deleteMany({ isSynthetic: true });
    console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing synthetic cases`);

    console.log(`\n📝 Generating ${count} synthetic FIR cases...`);
    const cases = [];
    
    // Generate cases from templates
    for (let i = 0; i < count; i++) {
      const template = CRIME_TEMPLATES[i % CRIME_TEMPLATES.length];
      const caseData = generateSyntheticCase(template, i + 1);
      cases.push(caseData);
      
      if ((i + 1) % 25 === 0) {
        console.log(`   Generated ${i + 1}/${count} cases...`);
      }
    }

    console.log('\n🔢 Generating embeddings for semantic search...');
    // Generate embeddings for each case
    const casesWithEmbeddings = [];
    for (let i = 0; i < cases.length; i++) {
      const caseData = cases[i];
      const textForEmbedding = `${caseData.title} ${caseData.description} ${caseData.ipcSections.join(' ')}`;
      
      try {
        const embedding = await generateEmbedding(textForEmbedding);
        casesWithEmbeddings.push({
          ...caseData,
          embedding
        });
        
        if ((i + 1) % 25 === 0) {
          console.log(`   Generated embeddings for ${i + 1}/${cases.length} cases...`);
        }
      } catch (error) {
        console.warn(`   Warning: Failed to generate embedding for case ${i + 1}, skipping embedding`);
        casesWithEmbeddings.push(caseData);
      }
    }

    console.log('\n💾 Inserting cases into database...');
    await Case.insertMany(casesWithEmbeddings);
    
    console.log(`\n✅ Successfully generated and inserted ${casesWithEmbeddings.length} synthetic FIR cases`);
    console.log('\n📊 Summary:');
    const statusCounts = await Case.aggregate([
      { $match: { isSynthetic: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    statusCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} cases`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run if executed directly
// When run via: node scripts/generateSyntheticCases.js [count]
// process.argv[1] will contain the script path
const scriptPath = process.argv[1] || '';
if (scriptPath.includes('generateSyntheticCases.js')) {
  const count = parseInt(process.argv[2]) || 150;
  generateSyntheticCases(count).catch(console.error);
}

export { generateSyntheticCases };

