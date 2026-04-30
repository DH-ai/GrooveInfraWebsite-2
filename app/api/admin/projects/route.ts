import { NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

type ProjectData = {
  title: string;
  slug: string;
  category: string;
  location: string;
  client_name: string;
  testimonial: string;
  description: string;
  year: number;
  area: string;
  duration: string;
  featured: boolean;
  tags: string[];
  cover_image?: string;
};

export async function POST(req: Request) {
  try {
    const body: ProjectData = await req.json();

    // Validate required fields
    if (
      !body.title ||
      !body.slug ||
      !body.location ||
      !body.client_name ||
      !body.testimonial ||
      !body.description ||
      !body.area ||
      !body.duration ||
      !body.tags.length
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create project directory structure
    const projectDir = join(process.cwd(), 'content', 'projects', body.slug);
    const imageDir = join(process.cwd(), 'public', 'images', 'projects', body.slug);

    if (!existsSync(projectDir)) {
      mkdirSync(projectDir, { recursive: true });
    }

    if (!existsSync(imageDir)) {
      mkdirSync(imageDir, { recursive: true });
    }

    // Create placeholder image URLs for initial setup
    const placeholder_images = [
      `https://picsum.photos/800/600?random=${Date.now()}`,
      `https://picsum.photos/800/600?random=${Date.now() + 1}`,
      `https://picsum.photos/800/600?random=${Date.now() + 2}`,
    ];

    // Create metadata.json
    const metadata = {
      title: body.title,
      slug: body.slug,
      category: body.category,
      location: body.location,
      client_name: body.client_name,
      testimonial: body.testimonial,
      description: body.description,
      year: body.year,
      area: body.area,
      duration: body.duration,
      featured: body.featured,
      tags: body.tags,
      ...(body.cover_image && { cover_image: body.cover_image }),
      placeholder_images,
    };

    const metadataPath = join(projectDir, 'metadata.json');
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      ok: true,
      message: 'Project created successfully',
      slug: body.slug,
      path: `/content/projects/${body.slug}/`,
      imagePath: `/public/images/projects/${body.slug}/`,
    });
  } catch (error) {
    console.error('[admin/projects] error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
