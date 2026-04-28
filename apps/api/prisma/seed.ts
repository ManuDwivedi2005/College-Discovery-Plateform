import { PrismaClient } from "@prisma/client";
import { colleges } from "@college/shared";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();

  for (const college of colleges) {
    await prisma.college.create({
      data: {
        slug: college.slug,
        name: college.name,
        location: college.location,
        state: college.state,
        ownership: college.ownership,
        feesAnnual: college.feesAnnual,
        rating: college.rating,
        placementRate: college.placementRate,
        medianPackageLpa: college.medianPackageLpa,
        highestPackageLpa: college.highestPackageLpa,
        establishedYear: college.establishedYear,
        overview: college.overview,
        exams: college.exams,
        tags: college.tags,
        recruiters: college.recruiters,
        courses: {
          create: college.courses.map((course) => ({
            name: course.name,
            duration: course.duration,
            annualFees: course.annualFees,
          })),
        },
        reviews: {
          create: college.reviews.map((review) => ({
            author: review.author,
            role: review.role,
            rating: review.rating,
            year: review.year,
            comment: review.comment,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
