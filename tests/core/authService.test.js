import { registerUser, loginUser } from "../../src/core/authService.js";

// Мокаем fetch для тестов
global.fetch = jest.fn();

describe("Auth Service", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test("registerUser sends POST to /register", async () => {
    const mockResponse = { success: true, user: { id: 1, email: "test@test.com" } };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await registerUser("test@test.com", "password123");
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/register"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );
    expect(result).toEqual(mockResponse);
  });

  test("loginUser saves token to localStorage", async () => {
    const mockResponse = {
      success: true,
      session: {
        access_token: "test-token",
        user: { id: 1, email: "test@test.com" }
      }
    };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    await loginUser("test@test.com", "password123");
    
    expect(localStorage.getItem("auth_token")).toBe("test-token");
    expect(JSON.parse(localStorage.getItem("auth_user"))).toEqual({
      id: 1,
      email: "test@test.com"
    });
  });
});