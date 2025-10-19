/* Test fixtures for Playwright UI tests */

export const categories = [
  { _id: "c1", name: "Category A", slug: "category-a" },
  { _id: "c2", name: "Category B", slug: "category-b" },
];

export const productsPage1 = [
  {
    _id: "p1",
    name: "Alpha Gadget",
    slug: "alpha-gadget",
    description: "A great gadget",
    price: 199,
    category: categories[0]._id,
  },
  {
    _id: "p2",
    name: "Beta Widget",
    slug: "beta-widget",
    description: "A better widget",
    price: 299,
    category: categories[1]._id,
  },
];

export const productCount = { total: productsPage1.length };

export const fakeAuth = {
  user: {
    _id: "u1",
    name: "Test User",
    email: "user@example.com",
    phone: "12345678",
    address: "123 Test St",
    role: 0,
  },
  token: "test-token",
};

export const cartWithOne = [
  {
    _id: productsPage1[0]._id,
    name: productsPage1[0].name,
    description: productsPage1[0].description,
    price: productsPage1[0].price,
    slug: productsPage1[0].slug,
  },
];
