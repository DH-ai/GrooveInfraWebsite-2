import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get('admin-session')

    if (!session || session.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validate required fields
    const required = [
      'title',
      'slug',
      'category',
      'location',
      'client_name',
      'testimonial',
      'description',
      'year',
      'area',
      'duration',
      'tags',
    ]

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate category
    const validCategories = ['commercial', 'retail', 'residential', 'civil']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const { slug, tags } = body

    // Ensure slug is valid
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Ensure tags is an array
    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'At least one tag is required' },
        { status: 400 }
      )
    }

    // Create project directory
    const projectDir = path.join(
      process.cwd(),
      'content',
      'projects',
      slug
    )

    // Check if project already exists
    try {
      await fs.access(projectDir)
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 409 }
      )
    } catch {
      // Directory doesn't exist, which is what we want
    }

    // Create the directory
    await fs.mkdir(projectDir, { recursive: true })

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
      featured: body.featured ?? false,
      tags: body.tags,
      placeholder_images: Array(4)
        .fill(null)
        .map((_, i) =>
          `https://picsum.photos/seed/${slug}-${i + 1}/1200/800`
        ),
      cover_image: `https://picsum.photos/seed/${slug}-1/1200/800`,
    }

    const metadataPath = path.join(projectDir, 'metadata.json')
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2)
    )

    // Create images directory
    const imagesDir = path.join(
      process.cwd(),
      'public',
      'images',
      'projects',
      slug
    )
    await fs.mkdir(imagesDir, { recursive: true })

    return NextResponse.json({
      ok: true,
      message: `Project "${body.title}" created successfully`,
      slug: body.slug,
      imageDir: `/images/projects/${slug}/`,
    })
  } catch (err) {
    console.error('[admin/projects] Error:', err)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
