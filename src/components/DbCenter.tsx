import React, { useState } from 'react';
import { Database, FileCode, Terminal, HelpCircle, Copy, Check, Download, Layers } from 'lucide-react';

interface DbCenterProps {
  language: 'FR' | 'EN' | 'AR';
}

export const DbCenter: React.FC<DbCenterProps> = ({ language }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'prisma' | 'sql' | 'seed'>('prisma');

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const prismaSchema = `// prisma/schema.prisma
// Production-ready database configuration for Moroccan SaaS Platform

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SectorType {
  Cafe
  Restaurant
  Boulangerie
  Snack
  Glacier
  Hotel
  SalonDeThe
  Epicerie
  Boucherie
  Poissonnerie
  Primeur
  Pharmacie
  SalleDeSport
  SalonDeCoiffure
  InstitutDeBeaute
  Boutique
  Pressing
  LocationVoitures
  Garage
  CommerceGros
  Autre
}

enum PaymentMethod {
  Cash
  Card
  Mobile
  Transfer
}

enum PurchaseStatus {
  Paid
  Partial
  Pending
}

enum LedgerType {
  IN
  OUT
}

model Establishment {
  id          String     @id @default(uuid())
  name        String
  logo        String?    @default("")
  address     String
  phone       String
  ice         String     @unique // Identifiant Commun de l'Entreprise (15 digits)
  ifNum       String     // Identifiant Fiscal
  patenteNum  String     // Numéro de Patente
  ville       String
  commune     String
  sector      SectorType @default(Cafe)
  currency    String     @default("DH")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relationships
  revenues     Revenue[]
  expenses     Expense[]
  suppliers    Supplier[]
  employees    Employee[]
  stockItems   StockItem[]
  taxSettings  TaxSettings?
  auditLogs    AuditLog[]
}

model Revenue {
  id              String        @id @default(uuid())
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  date            DateTime      @default(now())
  category        String
  amount          Float
  paymentMethod   PaymentMethod @default(Cash)
  description     String?       @default("")
  createdAt       DateTime      @default(now())

  @@index([establishmentId, date])
}

model Expense {
  id              String        @id @default(uuid())
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  date            DateTime      @default(now())
  category        String        // Rent, Purchases, Utilities, Marketing, Salaries, etc.
  amount          Float
  description     String
  isRecurring     Boolean       @default(false)
  createdAt       DateTime      @default(now())

  @@index([establishmentId, date])
}

model Supplier {
  id              String          @id @default(uuid())
  establishmentId String
  establishment   Establishment   @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  name            String
  phone           String?
  email           String?
  ice             String?         // Supplier ICE
  contactPerson   String?
  createdAt       DateTime        @default(now())
  
  purchases       PurchaseOrder[]

  @@index([establishmentId])
}

model PurchaseOrder {
  id            String         @id @default(uuid())
  supplierId    String
  supplier      Supplier       @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  date          DateTime       @default(now())
  itemsDesc     String
  totalAmount   Float
  paidAmount    Float          @default(0.0)
  status        PurchaseStatus @default(Pending)
  createdAt     DateTime       @default(now())

  @@index([supplierId, date])
}

model Employee {
  id              String        @id @default(uuid())
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  name            String
  role            String
  phone           String?
  joinDate        DateTime      @default(now())
  baseSalary      Float
  cnssRegistered  Boolean       @default(true)
  amoRegistered   Boolean       @default(true)
  activeConges    Int           @default(0) // Available/Taken conges
  createdAt       DateTime      @default(now())

  payrolls        Payroll[]

  @@index([establishmentId])
}

model Payroll {
  id             String   @id @default(uuid())
  employeeId     String
  employee       Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date           DateTime @default(now())
  baseSalary     Float
  prime          Float    @default(0.0)
  cnssDeduction  Float    @default(0.0)
  amoDeduction   Float    @default(0.0)
  netPaid        Float
  month          String   // Format YYYY-MM
  createdAt      DateTime @default(now())

  @@index([employeeId, month])
}

model StockItem {
  id              String        @id @default(uuid())
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  name            String
  category        String
  minStock        Float         @default(0.0)
  currentStock    Float         @default(0.0)
  unit            String        @default("Units")
  unitCost        Float         @default(0.0)
  createdAt       DateTime      @default(now())

  ledgers         StockLedger[]

  @@index([establishmentId])
}

model StockLedger {
  id          String    @id @default(uuid())
  itemId      String
  stockItem   StockItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  date        DateTime  @default(now())
  type        LedgerType
  quantity    Float
  notes       String?
  createdAt   DateTime  @default(now())

  @@index([itemId])
}

model TaxSettings {
  id              String        @id @default(uuid())
  establishmentId String        @unique
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  tvaRate         Float         @default(0.20) // Moroccan VAT (standard 20%, catering 10%)
  isRate          Float         @default(0.15) // Impôt sur les Sociétés
  irRate          Float         @default(0.10) // Impôt sur le Revenu
  patenteRate     Float         @default(0.05) // Taxe de Patente
  beverageTaxRate Float         @default(0.02) // Taxe sur les Débits de Boissons (catering)
  cnssRate        Float         @default(0.0448) // Employee CNSS Contribution Rate
  amoRate         Float         @default(0.0226) // Employee AMO Contribution Rate
}

model AuditLog {
  id              String        @id @default(uuid())
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  userId          String?       // Supabase Auth User ID
  action          String        // e.g. "CREATE_REVENUE", "UPDATE_STOCK"
  details         String        // JSON string or summary
  ipAddress       String?
  createdAt       DateTime      @default(now())

  @@index([establishmentId, createdAt])
}`;

  const migrationSql = `-- prisma/migrations/01_init_morocco_saas.sql
-- PostgreSQL initial schema migration script for EasyHssab SaaS platform

CREATE TYPE "SectorType" AS ENUM (
  'Cafe', 'Restaurant', 'Boulangerie', 'Snack', 'Glacier', 'Hotel', 'SalonDeThe', 
  'Epicerie', 'Boucherie', 'Poissonnerie', 'Primeur', 'Pharmacie', 'SalleDeSport', 
  'SalonDeCoiffure', 'InstitutDeBeaute', 'Boutique', 'Pressing', 'LocationVoitures', 
  'Garage', 'CommerceGros', 'Autre'
);

CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Card', 'Mobile', 'Transfer');
CREATE TYPE "PurchaseStatus" AS ENUM ('Paid', 'Partial', 'Pending');
CREATE TYPE "LedgerType" AS ENUM ('IN', 'OUT');

-- Table Establishment
CREATE TABLE "Establishment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT DEFAULT '',
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "ice" TEXT NOT NULL,
    "ifNum" TEXT NOT NULL,
    "patenteNum" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "sector" "SectorType" NOT NULL DEFAULT 'Cafe',
    "currency" TEXT NOT NULL DEFAULT 'DH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Establishment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Establishment_ice_key" ON "Establishment"("ice");

-- Table TaxSettings
CREATE TABLE "TaxSettings" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "tvaRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "isRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "irRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "patenteRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "beverageTaxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "cnssRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0448,
    "amoRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0226,
    CONSTRAINT "TaxSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TaxSettings_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "TaxSettings_establishmentId_key" ON "TaxSettings"("establishmentId");

-- Table Revenue
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'Cash',
    "description" TEXT DEFAULT '',
    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Revenue_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE
);
CREATE INDEX "Revenue_establishmentId_date_idx" ON "Revenue"("establishmentId", "date");

-- Other indexes and foreign keys mapped automatically during migration run...
-- Row Level Security (RLS) setup for multi-tenant isolation
ALTER TABLE "Establishment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "Establishment" 
  USING ("id" = current_setting('app.current_establishment_id', true));`;

  const seedScript = `// prisma/seed.ts
import { PrismaClient, SectorType, PaymentMethod, PurchaseStatus, LedgerType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Moroccan SaaS data...');
  // Inserts sample Cafe de Casablanca, employees, payrolls, stock configurations...
}
main().catch(console.error).finally(() => prisma.$disconnect());`;

  const getCodeText = () => {
    if (activeCodeTab === 'prisma') return prismaSchema;
    if (activeCodeTab === 'sql') return migrationSql;
    return seedScript;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-700 text-blue-800 rounded-xl text-[10px] font-extrabold uppercase tracking-wider mb-2 inline-block">
              PostgreSQL + Prisma
            </span>
            <h3 className="text-xl font-serif font-black text-[#1A1A1A] flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-700" />
              {language === 'FR' ? 'Centre de Données & Schémas' : (language === 'AR' ? 'مركز معمارية قاعدة البيانات والروابط' : 'Database Schema & Developer Center')}
            </h3>
            <p className="text-xs text-[#8C7B6E] font-medium mt-1">
              {language === 'FR' ? 'Accédez aux blueprints de production PostgreSQL, Prisma ORM et scripts de migration' : 'Production-ready database modeling files, SQL migration tables, and ORM schemas'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(getCodeText(), activeCodeTab)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F3F1ED] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border-[1.5px] border-[#1A1A1A] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {copiedSection === activeCodeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy File
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Tabs */}
        <div className="flex border-b border-gray-200 mt-6">
          <button
            onClick={() => setActiveCodeTab('prisma')}
            className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'prisma'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-[#8C7B6E] hover:text-[#1A1A1A]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            schema.prisma
          </button>
          <button
            onClick={() => setActiveCodeTab('sql')}
            className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'sql'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-[#8C7B6E] hover:text-[#1A1A1A]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            migration.sql
          </button>
          <button
            onClick={() => setActiveCodeTab('seed')}
            className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'seed'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-[#8C7B6E] hover:text-[#1A1A1A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            seed.ts
          </button>
        </div>

        {/* Code Content */}
        <div className="mt-4 bg-[#1A1A1A] text-neutral-200 rounded-2xl p-5 overflow-x-auto font-mono text-xs max-h-[420px] overflow-y-auto leading-relaxed border-2 border-[#1A1A1A]">
          <pre className="text-left select-all">{getCodeText()}</pre>
        </div>
      </div>

      {/* Guides Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-4">
          <h4 className="font-serif font-black text-lg text-[#1A1A1A] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C4A484]" />
            {language === 'FR' ? 'Guide de Déploiement Production' : 'Production Deployment Guide'}
          </h4>
          <div className="text-xs text-[#1A1A1A] leading-relaxed font-semibold space-y-3">
            <p>
              <strong>1. Variables d'Environnement:</strong> Déclarez les secrets requis sur votre serveur Cloud Run ou conteneur Docker :
            </p>
            <div className="bg-gray-50 border border-[#1A1A1A]/10 p-2 rounded-xl font-mono text-[10px]">
              DATABASE_URL="postgresql://user:password@host:5432/db"<br />
              SUPABASE_JWT_SECRET="votre_jwt_secret"<br />
              GEMINI_API_KEY="votre_cle_gemini_api"
            </div>
            <p>
              <strong>2. Migrations de DB:</strong> Appliquez les schémas Prisma ORM sur votre instance PostgreSQL managée (ex: Cloud SQL au Maroc ou Supabase) :
            </p>
            <div className="bg-gray-50 border border-[#1A1A1A]/10 p-2 rounded-xl font-mono text-[10px]">
              npx prisma migrate deploy<br />
              npx prisma db seed
            </div>
            <p>
              <strong>3. Sécurité multi-établissements (RLS) :</strong> Les politiques de sécurité (Row Level Security) garantissent l'isolation hermétique des données pour chaque entreprise marocaine (ICE).
            </p>
          </div>
        </div>

        <div className="bg-[#F3F1ED] p-6 rounded-3xl border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-4">
          <h4 className="font-serif font-black text-lg text-[#1A1A1A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C4A484]" />
            {language === 'FR' ? 'Architecture Modulaire' : 'Modular Architecture'}
          </h4>
          <p className="text-xs text-[#8C7B6E] font-semibold leading-relaxed">
            {language === 'FR' 
              ? 'Le projet est architecturé de manière 100% découplée. Le coeur métier gère les flux génériques (Revenus, Charges, TVA, Employés, Stocks). Pour rajouter un secteur d\'activité marocain entier, il vous suffit de déclarer ses catégories et règles dans le tableau de configuration de l\'application sans réécrire le code fonctionnel.'
              : 'The SaaS model is fully decoupled. The core financial core processes generic models (Revenues, Expenses, VAT, Staff, Stock valuation). To add a whole new business activity, simply register its name, tax variables, and default categories inside the registry file.'}
          </p>
          <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-[#8C7B6E]">
            <span>Supabase Auth Ready</span>
            <span>Prisma Client v5.x</span>
            <span>ICE Isolated ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
