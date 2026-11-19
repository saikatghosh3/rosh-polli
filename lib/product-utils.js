export function getDefaultProductSize(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const productPrice = Number(product?.price);
  return sizes.find((size) => Number(size.price) === productPrice) || sizes[0] || null;
}
