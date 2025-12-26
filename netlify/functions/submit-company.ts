import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface SubmitCompanyBody {
  name: string;
  category: string;
  products: string[];
  severity: "low" | "medium" | "high";
  notes: string;
}

interface Company extends SubmitCompanyBody {
  id: number;
  lastReported: string;
  verified: boolean;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const store = getStore("styrofoam-companies");

  try {
    const body: SubmitCompanyBody = await req.json();

    const newCompany: Company = {
      id: Date.now(),
      name: body.name,
      category: body.category,
      products: body.products,
      severity: body.severity,
      notes: body.notes,
      lastReported: new Date().getFullYear().toString(),
      verified: false,
    };

    await store.setJSON(`company-${newCompany.id}`, newCompany);

    return new Response(JSON.stringify({ success: true, company: newCompany }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error submitting company:", error);
    return new Response(JSON.stringify({ error: "Failed to submit company" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};