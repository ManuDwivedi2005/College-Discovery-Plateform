export type CollegeCourse = {
  name: string;
  duration: string;
  annualFees: number;
};

export type CollegeReview = {
  author: string;
  role: string;
  rating: number;
  year: number;
  comment: string;
};

export type College = {
  slug: string;
  name: string;
  location: string;
  state: string;
  ownership: "Public" | "Private";
  feesAnnual: number;
  rating: number;
  placementRate: number;
  medianPackageLpa: number;
  highestPackageLpa: number;
  establishedYear: number;
  exams: string[];
  tags: string[];
  overview: string;
  courses: CollegeCourse[];
  recruiters: string[];
  reviews: CollegeReview[];
};

export type CollegeQuery = {
  search?: string;
  location?: string;
  course?: string;
  maxFees?: number;
  page?: number;
  limit?: number;
};

export const colleges: College[] = [
  {
    slug: "nit-trichy",
    name: "National Institute of Technology, Trichy",
    location: "Tiruchirappalli",
    state: "Tamil Nadu",
    ownership: "Public",
    feesAnnual: 180000,
    rating: 4.7,
    placementRate: 91,
    medianPackageLpa: 12.4,
    highestPackageLpa: 42,
    establishedYear: 1964,
    exams: ["JEE Main"],
    tags: ["Top NIT", "Placements", "CSE"],
    overview:
      "A nationally respected engineering campus with strong industry outcomes, a compact academic culture, and a reputation for rigorous peer learning.",
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", annualFees: 180000 },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", annualFees: 180000 },
      { name: "M.Tech Data Science", duration: "2 years", annualFees: 95000 },
    ],
    recruiters: ["Microsoft", "Amazon", "Adobe", "Goldman Sachs"],
    reviews: [
      {
        author: "Aarav S.",
        role: "Final year student",
        rating: 5,
        year: 2025,
        comment: "Excellent placement culture and a highly motivated peer group.",
      },
      {
        author: "Nisha K.",
        role: "Alumni",
        rating: 4.8,
        year: 2024,
        comment: "Course load is intense, but the outcomes are worth it.",
      },
    ],
  },
  {
    slug: "vit-vellore",
    name: "VIT Vellore",
    location: "Vellore",
    state: "Tamil Nadu",
    ownership: "Private",
    feesAnnual: 220000,
    rating: 4.5,
    placementRate: 88,
    medianPackageLpa: 9.8,
    highestPackageLpa: 56,
    establishedYear: 1984,
    exams: ["VITEEE", "JEE Main"],
    tags: ["Innovation", "Large campus", "Industry"],
    overview:
      "A large, modern university environment with broad course availability, active student clubs, and strong industry participation.",
    courses: [
      { name: "B.Tech Information Technology", duration: "4 years", annualFees: 220000 },
      { name: "B.Tech Artificial Intelligence and Data Science", duration: "4 years", annualFees: 225000 },
      { name: "BBA", duration: "3 years", annualFees: 165000 },
    ],
    recruiters: ["Cisco", "Qualcomm", "TCS", "Infosys"],
    reviews: [
      {
        author: "Riya M.",
        role: "Third year student",
        rating: 4.4,
        year: 2025,
        comment: "The campus is active and the placement support is dependable.",
      },
      {
        author: "Karan P.",
        role: "Parent",
        rating: 4.3,
        year: 2024,
        comment: "Very structured admissions process and a wide range of programs.",
      },
    ],
  },
  {
    slug: "srm-chennai",
    name: "SRM Institute of Science and Technology",
    location: "Chennai",
    state: "Tamil Nadu",
    ownership: "Private",
    feesAnnual: 310000,
    rating: 4.3,
    placementRate: 84,
    medianPackageLpa: 8.2,
    highestPackageLpa: 41,
    establishedYear: 1985,
    exams: ["SRMJEEE", "JEE Main"],
    tags: ["AI", "Research", "Private university"],
    overview:
      "Known for broad program choice and strong engagement with emerging technology tracks, especially for students seeking flexibility.",
    courses: [
      { name: "B.Tech Artificial Intelligence", duration: "4 years", annualFees: 310000 },
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", annualFees: 305000 },
      { name: "MBA", duration: "2 years", annualFees: 220000 },
    ],
    recruiters: ["Wipro", "Accenture", "Deloitte", "Cognizant"],
    reviews: [
      {
        author: "Meera A.",
        role: "Student",
        rating: 4.2,
        year: 2025,
        comment: "Good infrastructure and enough options to explore multiple domains.",
      },
      {
        author: "Arjun V.",
        role: "Alumni",
        rating: 4.1,
        year: 2024,
        comment: "Best for students who want a large, active campus ecosystem.",
      },
    ],
  },
  {
    slug: "bits-pilani",
    name: "BITS Pilani",
    location: "Pilani",
    state: "Rajasthan",
    ownership: "Private",
    feesAnnual: 475000,
    rating: 4.8,
    placementRate: 94,
    medianPackageLpa: 16.2,
    highestPackageLpa: 60,
    establishedYear: 1964,
    exams: ["BITSAT"],
    tags: ["Premium", "Placements", "Research"],
    overview:
      "A premium engineering institution with deep alumni reach, intense academics, and consistently strong recruiter interest.",
    courses: [
      { name: "B.E. Computer Science", duration: "4 years", annualFees: 475000 },
      { name: "B.E. Electronics and Instrumentation", duration: "4 years", annualFees: 475000 },
      { name: "M.Sc. Economics", duration: "5 years", annualFees: 390000 },
    ],
    recruiters: ["Google", "Apple", "Microsoft", "Bain"],
    reviews: [
      {
        author: "Sneha D.",
        role: "Final year student",
        rating: 4.9,
        year: 2025,
        comment: "The academic pressure is real, but the industry credibility is unmatched.",
      },
      {
        author: "Aman R.",
        role: "Alumni",
        rating: 4.8,
        year: 2024,
        comment: "A strong brand name that opens doors everywhere.",
      },
    ],
  },
  {
    slug: "anna-university-cce",
    name: "College of Engineering, Guindy",
    location: "Chennai",
    state: "Tamil Nadu",
    ownership: "Public",
    feesAnnual: 85000,
    rating: 4.4,
    placementRate: 87,
    medianPackageLpa: 7.6,
    highestPackageLpa: 28,
    establishedYear: 1794,
    exams: ["TNEA"],
    tags: ["Affordable", "Legacy", "Core engineering"],
    overview:
      "A historic public engineering school with strong value for money, a classic campus environment, and solid placement outcomes.",
    courses: [
      { name: "B.E. Computer Science", duration: "4 years", annualFees: 85000 },
      { name: "B.E. Mechanical Engineering", duration: "4 years", annualFees: 85000 },
      { name: "M.E. Software Engineering", duration: "2 years", annualFees: 65000 },
    ],
    recruiters: ["Zoho", "TCS", "Bosch", "L&T"],
    reviews: [
      {
        author: "Priya T.",
        role: "Student",
        rating: 4.5,
        year: 2025,
        comment: "Great value for money and a respected brand in Tamil Nadu.",
      },
      {
        author: "Vignesh M.",
        role: "Alumni",
        rating: 4.4,
        year: 2024,
        comment: "An old campus, but still very relevant for core engineering.",
      },
    ],
  },
  {
    slug: "iiit-hyderabad",
    name: "IIIT Hyderabad",
    location: "Hyderabad",
    state: "Telangana",
    ownership: "Private",
    feesAnnual: 420000,
    rating: 4.9,
    placementRate: 96,
    medianPackageLpa: 18.4,
    highestPackageLpa: 65,
    establishedYear: 1998,
    exams: ["JEE Main", "UGEE"],
    tags: ["Research", "AI/ML", "Elite"],
    overview:
      "A research-intensive institute with exceptional computer science strength, competitive admissions, and high placement intensity.",
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", annualFees: 420000 },
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", annualFees: 420000 },
      { name: "MS by Research", duration: "2 years", annualFees: 250000 },
    ],
    recruiters: ["Google", "Meta", "Nvidia", "Adobe"],
    reviews: [
      {
        author: "Rohan I.",
        role: "Research scholar",
        rating: 5,
        year: 2025,
        comment: "One of the strongest computer science environments in India.",
      },
      {
        author: "Ananya S.",
        role: "Alumni",
        rating: 4.9,
        year: 2024,
        comment: "Small, intense, and incredibly rewarding academically.",
      },
    ],
  },
  {
    slug: "rvce-bengaluru",
    name: "RV College of Engineering",
    location: "Bengaluru",
    state: "Karnataka",
    ownership: "Private",
    feesAnnual: 245000,
    rating: 4.6,
    placementRate: 89,
    medianPackageLpa: 10.1,
    highestPackageLpa: 34,
    establishedYear: 1963,
    exams: ["KCET", "COMEDK"],
    tags: ["Bengaluru", "Industry", "Strong ROI"],
    overview:
      "A well-known private engineering college with strong corporate access thanks to location and a consistent alumni network.",
    courses: [
      { name: "B.E. Computer Science and Engineering", duration: "4 years", annualFees: 245000 },
      { name: "B.E. Electronics and Communication Engineering", duration: "4 years", annualFees: 245000 },
      { name: "B.E. Mechanical Engineering", duration: "4 years", annualFees: 245000 },
    ],
    recruiters: ["Amazon", "Cisco", "SAP", "HP"],
    reviews: [
      {
        author: "Divya N.",
        role: "Student",
        rating: 4.6,
        year: 2025,
        comment: "Very practical ecosystem with Bangalore advantage.",
      },
      {
        author: "Siddharth G.",
        role: "Alumni",
        rating: 4.5,
        year: 2024,
        comment: "Solid college if you want balanced academics and access to recruiters.",
      },
    ],
  },
];

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function findCollegeBySlug(slug: string): College | undefined {
  return colleges.find((college) => college.slug === slug);
}

export function filterColleges(query: CollegeQuery): College[] {
  const search = query.search?.trim().toLowerCase();
  const location = query.location?.trim().toLowerCase();
  const course = query.course?.trim().toLowerCase();
  const maxFees = query.maxFees;

  return colleges.filter((college) => {
    const matchesSearch = !search || college.name.toLowerCase().includes(search);
    const matchesLocation = !location || college.location.toLowerCase() === location;
    const matchesCourse =
      !course ||
      college.courses.some((item) => item.name.toLowerCase().includes(course));
    const matchesFees = typeof maxFees !== "number" || college.feesAnnual <= maxFees;

    return matchesSearch && matchesLocation && matchesCourse && matchesFees;
  });
}

export function paginateColleges(collegeList: College[], page = 1, limit = 6) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  return {
    items: collegeList.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total: collegeList.length,
    totalPages: Math.max(1, Math.ceil(collegeList.length / safeLimit)),
  };
}

export function compareColleges(slugs: string[]): College[] {
  const uniqueSlugs = [...new Set(slugs)].slice(0, 3);
  return uniqueSlugs.map((slug) => findCollegeBySlug(slug)).filter(Boolean) as College[];
}
