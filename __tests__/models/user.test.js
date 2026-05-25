import "../test-setup";
import { describe, it, expect } from "vitest";
import User from "../../src/models/User.js";

describe("User Model", () => {
  it("should create a user", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@test.com",
      profileImage: "https://example.com/image.jpg",
    });

    expect(user).toBeDefined();
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@test.com");
    expect(user.profileImage).toBe("https://example.com/image.jpg");
  });

  // TODO: Test that email must be unique
  it("should require unique email", async () => {
    await User.create({
      username: "user1",
      email: "unique@test.com",
      profileImage: "https://example.com/a.jpg",
    });

    await expect(
      User.create({
        username: "user2",
        email: "unique@test.com",
        profileImage: "https://example.com/b.jpg",
      })
    ).rejects.toThrow();
  });

  // TODO: Test that username must be unique
  it("should require unique username", async () => {
    await User.create({
      username: "sameuser",
      email: "first@test.com",
      profileImage: "https://example.com/a.jpg",
    });

    await expect(
      User.create({
        username: "sameuser",
        email: "second@test.com",
        profileImage: "https://example.com/b.jpg",
      })
    ).rejects.toThrow();
  });

  // TODO: Test that email format is validated
  it("should validate email format", async () => {
    await expect(
      User.create({
        username: "bademail",
        email: "not-an-email",
        profileImage: "https://example.com/img.jpg",
      })
    ).rejects.toThrow();
  });

  // TODO: Test that profileImage is a valid URL
  it("should validate profileImage as a valid URL", async () => {
    await expect(
      User.create({
        username: "imgtest",
        email: "img@test.com",
        profileImage: "not-a-url",
      })
    ).rejects.toThrow();
  });
});
