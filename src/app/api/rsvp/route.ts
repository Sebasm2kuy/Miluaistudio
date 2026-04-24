import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, guests, message } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    if (!guests || typeof guests !== "number" || guests < 1 || guests > 10) {
      return NextResponse.json(
        { error: "La cantidad de invitados debe ser entre 1 y 10" },
        { status: 400 }
      );
    }

    const rsvp = await db.rsvp.create({
      data: {
        name: name.trim(),
        guests,
        message: message?.trim() || null,
      },
    });

    return NextResponse.json(
      { message: "Confirmación registrada exitosamente", id: rsvp.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
