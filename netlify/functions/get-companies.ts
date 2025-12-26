import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface Company {
  id: number;
  name: string;
  category: string;
  products: string[];
  severity: "low" | "medium" | "high";
  notes: string;
  lastReported: string;
  verified: boolean;
}

export default async (req: Request, context: Context) => {
  const store = getStore("styrofoam-companies");

  try {
    const { blobs } = await store.list();

    if (!blobs || blobs.length === 0) {
      const defaultCompanies: Company[] = [
        {
          id: Date.now() + 1,
          name: "Omaha Steaks",
          category: "Food Delivery",
          products: ["Frozen meat deliveries", "Steaks", "Seafood"],
          severity: "high",
          notes: "Ships frozen meat products in styrofoam coolers with dry ice",
          lastReported: "2024",
          verified: true,
        },
        {
          id: Date.now() + 2,
          name: "Many Large Appliance Manufacturers",
          category: "Appliances",
          products: ["Refrigerators", "Washers", "Dryers", "TVs"],
          severity: "high",
          notes: "Industry still heavily relies on EPS foam blocks for large appliance shipping protection",
          lastReported: "2025",
          verified: false,
        },
        {
          id: Date.now() + 3,
          name: "Electronics Retailers (Various)",
          category: "Electronics Retail",
          products: ["TVs", "Monitors", "Large electronics"],
          severity: "medium",
          notes: "Many electronics still ship with styrofoam inserts despite sustainability efforts",
          lastReported: "2024",
          verified: false,
        },
        {
          id: Date.now() + 4,
          name: "Seafood Delivery Services",
          category: "Food Delivery",
          products: ["Fresh seafood", "Fish", "Shellfish"],
          severity: "high",
          notes: "Seafood industry continues using EPS coolers for temperature-sensitive shipments",
          lastReported: "2024",
          verified: false,
        },
        {
          id: Date.now() + 5,
          name: "Pharmaceutical Shippers",
          category: "Healthcare",
          products: ["Temperature-sensitive medications", "Vaccines", "Biologics"],
          severity: "medium",
          notes: "Medical supply chain still relies on EPS for temperature control during shipping",
          lastReported: "2024",
          verified: false,
        },
        {
          id: Date.now() + 6,
          name: "Many Furniture Retailers",
          category: "Furniture",
          products: ["Furniture", "Large home goods"],
          severity: "medium",
          notes: "Furniture industry uses EPS corner blocks and protective inserts",
          lastReported: "2024",
          verified: false,
        },
        {
          id: Date.now() + 7,
          name: "Takeout Restaurants (Thousands Still Use It)",
          category: "Food Service",
          products: ["Hot food containers", "Beverage cups", "To-go boxes"],
          severity: "high",
          notes: "Despite many bans, thousands of restaurants still use polystyrene foam food containers",
          lastReported: "2025",
          verified: false,
        },
      ];

      for (const company of defaultCompanies) {
        await store.setJSON(`company-${company.id}`, company);
      }

      return new Response(JSON.stringify({ companies: defaultCompanies }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const companies = await Promise.all(
      blobs.map(async (blob) => {
        return await store.get(blob.key, { type: "json" });
      })
    );

    return new Response(JSON.stringify({ companies }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch companies" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};