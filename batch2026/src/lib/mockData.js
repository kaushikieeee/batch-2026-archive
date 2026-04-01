// ── Mock data for development (replace with Supabase when ready) ──

export const mockStudents = [
  { id: 1, name: 'Aanya Krishnan', section: 'CSE-A', role: 'Class Rep', quote: 'The best is yet to come.', image: null, instagram: 'aanya.k', linkedin: 'aanya-krishnan', phone: null },
  { id: 2, name: 'Rohan Mehta', section: 'CSE-B', role: 'Hackathon King', quote: 'Code is poetry.', image: null, instagram: 'rohan.mehta', linkedin: 'rohan-mehta', phone: null },
  { id: 3, name: 'Priya Nair', section: 'CSE-A', role: 'Tech Lead', quote: 'Debug life like code.', image: null, instagram: null, linkedin: 'priya-nair-cse', phone: null },
  { id: 4, name: 'Arjun Sharma', section: 'CSE-C', role: 'Sports Captain', quote: 'Work hard, play harder.', image: null, instagram: 'arjun.s', linkedin: null, phone: null },
  { id: 5, name: 'Divya Reddy', section: 'CSE-B', role: 'Designer', quote: 'Make it beautiful.', image: null, instagram: 'divya.designs', linkedin: 'divya-reddy', phone: null },
  { id: 6, name: 'Karthik Iyer', section: 'CSE-A', role: 'Topper', quote: 'Knowledge is power.', image: null, instagram: null, linkedin: 'karthik-iyer', phone: null },
  { id: 7, name: 'Sneha Pillai', section: 'CSE-C', role: 'Cultural Head', quote: 'Art speaks louder.', image: null, instagram: 'sneha.art', linkedin: null, phone: null },
  { id: 8, name: 'Vivek Rao', section: 'CSE-B', role: 'Startup Founder', quote: 'Ship it and iterate.', image: null, instagram: 'vivek.rao', linkedin: 'vivek-rao-founder', phone: null },
  { id: 9, name: 'Meera Joshi', section: 'CSE-A', role: 'Research Scholar', quote: 'Ask more questions.', image: null, instagram: null, linkedin: 'meera-joshi', phone: null },
  { id: 10, name: 'Nikhil Bose', section: 'CSE-C', role: 'Music Producer', quote: 'Life has a rhythm.', image: null, instagram: 'nikhil.music', linkedin: null, phone: null },
  { id: 11, name: 'Kavya Menon', section: 'CSE-A', role: 'ML Enthusiast', quote: 'Train hard, infer harder.', image: null, instagram: 'kavya.m', linkedin: 'kavya-menon', phone: null },
  { id: 12, name: 'Siddharth Kumar', section: 'CSE-B', role: 'Open Source Dev', quote: 'Build in public.', image: null, instagram: null, linkedin: 'siddharth-kumar-oss', phone: null },
]

export const mockMessages = [
  { id: 1, name: 'Rohan', message: 'These four years were the greatest adventure of my life. Miss you all already!', created_at: '2026-03-01T10:00:00Z', rotation: -2 },
  { id: 2, name: 'Priya', message: 'Late nights, cold coffee, last-minute submissions... I would do it all again in a heartbeat.', created_at: '2026-03-02T14:00:00Z', rotation: 1.5 },
  { id: 3, name: 'Anonymous', message: 'To the batch that made chaos look elegant — thank you. 🌙', created_at: '2026-03-03T09:00:00Z', rotation: -1 },
  { id: 4, name: 'Aanya', message: 'Every deadline survived, every exam endured. We actually did it!', created_at: '2026-03-04T16:00:00Z', rotation: 2.5 },
  { id: 5, name: 'Karthik', message: 'The canteen, the labs, the corridors — everything will be missed. You guys were home.', created_at: '2026-03-05T11:00:00Z', rotation: -3 },
  { id: 6, name: 'Divya', message: 'From confused first-years to (slightly less confused) graduates. What a journey.', created_at: '2026-03-06T13:00:00Z', rotation: 1 },
  { id: 7, name: 'Nikhil', message: 'Every song I make will carry a piece of these four years. 🎵', created_at: '2026-03-07T09:00:00Z', rotation: -2.5 },
  { id: 8, name: 'Anonymous', message: 'I never said it enough — but you all made this worth it.', created_at: '2026-03-08T15:00:00Z', rotation: 1.8 },
]

export const mockTimeline = [
  {
    year: 'First Year · 2024',
    title: 'The Beginning',
    body: `We arrived with nervous smiles and overstuffed bags. The campus felt enormous — the labs intimidating, the seniors mysterious. We didn't know each other's names yet. We only knew we were in it together. Those first-year nights, debugging basic C code, arguing about who'd order the food — they were the quiet seeds of something irreplaceable.`,
    tag: '2024',
    color: 'rgba(244,196,48,0.06)',
  },
  {
    year: 'Second Year · 2023',
    title: 'Finding Our People',
    body: `Friendships solidified over shared all-nighters and mutual suffering through data structures. We found our tribes — the coders, the designers, the dreamers, the ones who somehow always had extra snacks. The campus started feeling less like a building and more like a world we were slowly building together.`,
    tag: '2023',
    color: 'rgba(244,196,48,0.05)',
  },
  {
    year: 'Third Year · 2024',
    title: 'The Grind',
    body: `Projects. Internships. Placements. The pressure was real, but so was the support. We pulled each other through. Someone always had notes when you missed class. Someone always stayed up to review your resume. Third year taught us what it meant to actually have each other's backs.`,
    tag: '2024',
    color: 'rgba(244,196,48,0.04)',
  },
  {
    year: 'Final Year · 2025–26',
    title: 'The Last Chapter',
    body: `Everything became laced with the bittersweet knowledge that it was all ending. Every last class, every last canteen meal, every last walk through those corridors. We grew quieter, somehow, and more grateful. We started photographing ordinary moments. We started saying things we'd been meaning to say for four years.`,
    tag: '2026',
    color: 'rgba(244,196,48,0.03)',
  },
]

export const mockMedia = [
  { id: 1, year: '1st yr', type: 'image', src: null, caption: 'Orientation Day — Sept 2024', aspect: 'tall' },
  { id: 2, year: '1st yr', type: 'image', src: null, caption: 'First hackathon', aspect: 'wide' },
  { id: 3, year: '2nd yr', type: 'image', src: null, caption: 'Cultural Fest — Echoes 2023', aspect: 'square' },
  { id: 4, year: '2nd yr', type: 'image', src: null, caption: 'Sports Day victory', aspect: 'tall' },
  { id: 5, year: '3rd yr', type: 'image', src: null, caption: 'Internship send-off', aspect: 'wide' },
  { id: 6, year: '3rd yr', type: 'image', src: null, caption: 'Tech symposium 2024', aspect: 'square' },
  { id: 7, year: '4th yr', type: 'image', src: null, caption: 'Final year project expo', aspect: 'tall' },
  { id: 8, year: '4th yr', type: 'image', src: null, caption: 'Farewell night', aspect: 'wide' },
  { id: 9, year: '1st yr', type: 'image', src: null, caption: 'Lab session chaos', aspect: 'square' },
  { id: 10, year: '4th yr', type: 'image', src: null, caption: 'Graduation rehearsal', aspect: 'tall' },
  { id: 11, year: '2nd yr', type: 'image', src: null, caption: 'Library all-nighter', aspect: 'square' },
  { id: 12, year: '3rd yr', type: 'image', src: null, caption: 'Campus fest backstage', aspect: 'wide' },
]
