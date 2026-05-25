import "../test-setup";
import { describe, it, expect } from "vitest";
import Accommodation from "../../src/models/Accommodation.js";
import User from "../../src/models/User.js";

describe("Accommodation Model", () => {
  it("should create an accommodation", async () => {
    const user = await User.create({
      username: "owner",
      email: "owner@test.com",
      profileImage: "https://example.com/img.jpg",
    });

    const acc = await Accommodation.create({
      address: "Test Street 1",
      city: "Stockholm",
      country: "Sweden",
      postalCode: "11122",
      rent: 12000,
      rooms: 3,
      userId: user._id,
    });

    expect(acc).toBeDefined();
    expect(acc.address).toBe("Test Street 1");
    expect(acc.city).toBe("Stockholm");
    expect(acc.country).toBe("Sweden");
    expect(acc.postalCode).toBe("11122");
    expect(acc.rent).toBe(12000);
    expect(acc.rooms).toBe(3);
    expect(acc.userId.toString()).toBe(user._id.toString());
  });

  it("should require all fields", async () => {
    await expect(
      Accommodation.create({
        city: "Stockholm",
      })
    ).rejects.toThrow();
  });

  it("should require rent to be a positive number", async () => {
    const user = await User.create({
      username: "rentuser",
      email: "rent@test.com",
      profileImage: "https://example.com/img.jpg",
    });

    await expect(
      Accommodation.create({
        address: "Bad Rent St",
        city: "Stockholm",
        country: "Sweden",
        postalCode: "11122",
        rent: -5000,
        rooms: 2,
        userId: user._id,
      })
    ).rejects.toThrow();
  });

  it("should require rooms to be a positive number", async () => {
    const user = await User.create({
      username: "roomuser",
      email: "room@test.com",
      profileImage: "https://example.com/img.jpg",
    });

    await expect(
      Accommodation.create({
        address: "Bad Rooms St",
        city: "Stockholm",
        country: "Sweden",
        postalCode: "11122",
        rent: 8000,
        rooms: 0,
        userId: user._id,
      })
    ).rejects.toThrow();
  });

  it("should reference a valid userId", async () => {
    await expect(
      Accommodation.create({
        address: "No User St",
        city: "Stockholm",
        country: "Sweden",
        postalCode: "11122",
        rent: 9000,
        rooms: 2,
        userId: "123456789012", // invalid ObjectId
      })
    ).rejects.toThrow();
  });
});

describe("Accommodation Cascade Delete", () => {
  it("should delete accommodations when user is deleted", async () => {
    const user = await User.create({
      username: "cascade",
      email: "cascade@test.com",
      profileImage: "https://example.com/img.jpg",
    });

    await Accommodation.create({
      address: "Cascade St 1",
      city: "Stockholm",
      country: "Sweden",
      postalCode: "11122",
      rent: 10000,
      rooms: 2,
      userId: user._id,
    });

    await Accommodation.create({
      address: "Cascade St 2",
      city: "Stockholm",
      country: "Sweden",
      postalCode: "11122",
      rent: 15000,
      rooms: 4,
      userId: user._id,
    });

    // Delete user → should trigger cascade delete
    await User.findByIdAndDelete(user._id);

    const remaining = await Accommodation.find({ userId: user._id });
    expect(remaining).toHaveLength(0);
  });
});
