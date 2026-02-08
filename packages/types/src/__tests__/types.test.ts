import { describe, it, expect } from "vitest";
import type { MedicationType, InstanceStatus, UserRole } from "../index";

describe("@yuki/types", () => {
  it("MedicationType includes expected values", () => {
    const types: MedicationType[] = ["eye_drop", "oral", "supplement", "topical"];
    expect(types).toHaveLength(4);
  });

  it("InstanceStatus includes expected values", () => {
    const statuses: InstanceStatus[] = ["pending", "confirmed", "snoozed", "skipped"];
    expect(statuses).toHaveLength(4);
  });

  it("UserRole includes expected values", () => {
    const roles: UserRole[] = ["admin", "caretaker"];
    expect(roles).toHaveLength(2);
  });
});
