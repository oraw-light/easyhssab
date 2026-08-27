// @ts-nocheck
// prisma/seed.ts
// Database seeding script to populate PostgreSQL tables with Moroccan business demo datasets

import { PrismaClient, SectorType, PaymentMethod, PurchaseStatus, LedgerType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Moroccan SaaS database seed...');

  // 1. Create a sample Establishment (Café de Casablanca)
  const establishment = await prisma.establishment.create({
    data: {
      name: "Café de Casablanca",
      logo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150",
      address: "24 Boulevard de la Corniche, Anfa, Casablanca",
      phone: "+212 522 45 87 96",
      ice: "001874625000184", // 15-digit real ICE structure
      ifNum: "45879213",
      patenteNum: "34120984",
      ville: "Casablanca",
      commune: "Anfa",
      sector: SectorType.Cafe,
      currency: "DH"
    }
  });

  console.log(`Created Establishment: ${establishment.name} (ID: ${establishment.id})`);

  // 2. Set up Tax Settings
  const taxSettings = await prisma.taxSettings.create({
    data: {
      establishmentId: establishment.id,
      tvaRate: 0.10, // 10% VAT for café services
      isRate: 0.15,  // 15% corporate income tax standard bracket
      irRate: 0.10,  // 10% average employee income tax
      patenteRate: 0.05,
      beverageTaxRate: 0.02, // 2% beverage débit tax
      cnssRate: 0.0448, // 4.48% employee deduction
      amoRate: 0.0226  // 2.26% employee deduction
    }
  });

  // 3. Create Employees
  const emp1 = await prisma.employee.create({
    data: {
      establishmentId: establishment.id,
      name: "Yassine Mansouri",
      role: "Barista Principal",
      phone: "+212 661 23 45 67",
      joinDate: new Date("2025-01-15"),
      baseSalary: 4500, // standard barista salary in Casablanca
      cnssRegistered: true,
      amoRegistered: true,
      activeConges: 18
    }
  });

  const emp2 = await prisma.employee.create({
    data: {
      establishmentId: establishment.id,
      name: "Khadija Bennani",
      role: "Serveuse Senior",
      phone: "+212 662 98 76 54",
      joinDate: new Date("2025-03-10"),
      baseSalary: 4000,
      cnssRegistered: true,
      amoRegistered: true,
      activeConges: 15
    }
  });

  console.log('Created employees: Yassine, Khadija');

  // 4. Create payrolls
  await prisma.payroll.createMany({
    data: [
      {
        employeeId: emp1.id,
        date: new Date("2026-05-30"),
        baseSalary: 4500,
        prime: 300,
        cnssDeduction: 4500 * 0.0448,
        amoDeduction: 4500 * 0.0226,
        netPaid: 4500 + 300 - (4500 * 0.0448) - (4500 * 0.0226),
        month: "2026-05"
      },
      {
        employeeId: emp2.id,
        date: new Date("2026-05-30"),
        baseSalary: 4000,
        prime: 200,
        cnssDeduction: 4000 * 0.0448,
        amoDeduction: 4000 * 0.0226,
        netPaid: 4000 + 200 - (4000 * 0.0448) - (4000 * 0.0226),
        month: "2026-05"
      }
    ]
  });

  // 5. Create Suppliers & Purchase Orders
  const supplier = await prisma.supplier.create({
    data: {
      establishmentId: establishment.id,
      name: "Cafés Carrion Maroc",
      phone: "+212 522 23 14 56",
      email: "contact@carrion.ma",
      ice: "000341852000045",
      contactPerson: "Amine Carrion"
    }
  });

  await prisma.purchaseOrder.create({
    data: {
      supplierId: supplier.id,
      date: new Date("2026-06-05"),
      itemsDesc: "30kg grains Arabica premium + filtres café",
      totalAmount: 3800,
      paidAmount: 3800,
      status: PurchaseStatus.Paid
    }
  });

  // 6. Create Stock Items & Ledgers
  const stock1 = await prisma.stockItem.create({
    data: {
      establishmentId: establishment.id,
      name: "Café Arabica en grains (Grains)",
      category: "Grains",
      minStock: 10,
      currentStock: 35,
      unit: "kg",
      unitCost: 110
    }
  });

  await prisma.stockLedger.create({
    data: {
      itemId: stock1.id,
      type: LedgerType.IN,
      quantity: 30,
      notes: "Livraison Cafés Carrion du 5 Juin"
    }
  });

  // 7. Create Sample Revenues
  await prisma.revenue.createMany({
    data: [
      {
        establishmentId: establishment.id,
        date: new Date("2026-06-15"),
        category: "Café",
        amount: 1450,
        paymentMethod: PaymentMethod.Cash,
        description: "Recettes Journée - POS terminal 1"
      },
      {
        establishmentId: establishment.id,
        date: new Date("2026-06-16"),
        category: "Pâtisseries & Boulange",
        amount: 820,
        paymentMethod: PaymentMethod.Card,
        description: "Recettes Journée - POS terminal 1"
      }
    ]
  });

  // 8. Create Sample Expenses
  await prisma.expense.createMany({
    data: [
      {
        establishmentId: establishment.id,
        date: new Date("2026-06-01"),
        category: "Rent",
        amount: 6000,
        description: "Loyer commercial du local - Juin 2026",
        isRecurring: true
      },
      {
        establishmentId: establishment.id,
        date: new Date("2026-06-10"),
        category: "Electricity",
        amount: 890,
        description: "Facture Lydec Électricité - Juin 2026",
        isRecurring: false
      }
    ]
  });

  // 9. Add Audit Logs
  await prisma.auditLog.create({
    data: {
      establishmentId: establishment.id,
      action: "SEED_DATABASE",
      details: "Initial schema demo database seeding process completed.",
      ipAddress: "127.0.0.1"
    }
  });

  console.log('Moroccan SaaS database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
