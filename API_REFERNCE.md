# API Reference

## Supabase Database Tables

### user_profiles
```typescript
{
  id: uuid (PRIMARY KEY, references auth.users)
  name: string
  age: number (optional)
  created_at: timestamp
}
```

**RLS Policies:**
- Users can view/insert/update their own profile only

### cycles
```typescript
{
  id: uuid (PRIMARY KEY)
  user_id: uuid (FOREIGN KEY -> auth.users)
  cycle_length: number
  mood: string
  energy: string
  date: timestamp
  created_at: timestamp
}
```

**RLS Policies:**
- Users can view/insert/update/delete their own cycles only

### text_analyses
```typescript
{
  id: uuid (PRIMARY KEY)
  user_id: uuid (FOREIGN KEY -> auth.users)
  input_text: string
  ai_response: string
  created_at: timestamp
}
```

**RLS Policies:**
- Users can view/insert their own analyses only

### image_analyses
```typescript
{
  id: uuid (PRIMARY KEY)
  user_id: uuid (FOREIGN KEY -> auth.users)
  image_url: string
  red_intensity: number
  risk_level: string
  analysis_result: string
  created_at: timestamp
}
```

**RLS Policies:**
- Users can view/insert their own analyses only

## Edge Functions

### Text Analysis

**Endpoint:** `POST /functions/v1/text-analysis`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SUPABASE_ANON_KEY}
```

**Request Body:**
```json
{
  "text": "I've been experiencing heavy flow and cramping",
  "userId": "user-uuid-here"
}
```

**Response:**
```json
{
  "analysis": "AI-generated wellness advice with nutrition, hydration, and self-care tips"
}
```

**Error Response:**
```json
{
  "error": "Missing required fields"
}
```

**Features:**
- OpenAI GPT-3.5 integration
- Fallback to default wellness tips if API unavailable
- Automatically saves to text_analyses table
- Returns personalized wellness advice

### Image Analysis

**Endpoint:** `POST /functions/v1/image-analysis`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {SUPABASE_ANON_KEY}
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "userId": "user-uuid-here"
}
```

**Response:**
```json
{
  "riskLevel": "Low|Moderate|High",
  "redIntensity": 123.45,
  "analysis": "Detailed health risk assessment text"
}
```

**Error Response:**
```json
{
  "error": "Missing required fields"
}
```

**Features:**
- Red intensity algorithm analysis
- Risk level classification
- Anemia detection indicators
- Automatically saves to image_analyses table

## Supabase Client Usage

### Authentication

**Sign Up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

**Sign In:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

**Sign Out:**
```typescript
const { error } = await supabase.auth.signOut();
```

**Get Session:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Database Queries

**Insert Cycle:**
```typescript
const { data, error } = await supabase
  .from('cycles')
  .insert({
    user_id: userId,
    cycle_length: 28,
    mood: 'Happy',
    energy: 'High',
    date: new Date().toISOString()
  });
```

**Get User Cycles:**
```typescript
const { data, error } = await supabase
  .from('cycles')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false })
  .limit(10);
```

**Get User Profile:**
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();
```

**Create User Profile:**
```typescript
const { error } = await supabase
  .from('user_profiles')
  .insert({
    id: userId,
    name: 'Jane Doe',
    age: 28
  });
```

**Get Text Analysis History:**
```typescript
const { data, error } = await supabase
  .from('text_analyses')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Get Image Analysis History:**
```typescript
const { data, error } = await supabase
  .from('image_analyses')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

## Frontend API Integration

### Calling Edge Functions

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const response = await fetch(`${supabaseUrl}/functions/v1/text-analysis`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
  body: JSON.stringify({ text, userId }),
});

const data = await response.json();
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OPENAI_API_KEY=sk-your-openai-key-here
```

**Note:** The OPENAI_API_KEY is also automatically available in Edge Functions as `Deno.env.get("OPENAI_API_KEY")`

## Error Handling

### Frontend Pattern
```typescript
try {
  const { data, error } = await supabase.from('cycles').insert({...});
  if (error) throw error;
  // Success handling
} catch (err: any) {
  setError(err.message || 'Failed to save');
}
```

### Edge Function Pattern
```typescript
try {
  // Process request
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: corsHeaders,
  });
} catch (error) {
  return new Response(JSON.stringify({ error: 'Failed' }), {
    status: 500,
    headers: corsHeaders,
  });
}
```

## Rate Limits

- Supabase: Depends on your plan (Free tier: 50,000 monthly active users)
- OpenAI: Depends on your API tier (default: 3 requests/min for free tier)
- Edge Functions: 500,000 invocations/month on free tier

## Best Practices

1. Always use `.maybeSingle()` instead of `.single()` when expecting 0 or 1 results
2. Include proper error handling for all database operations
3. Use RLS policies instead of client-side filtering
4. Cache static data to reduce API calls
5. Use loading states for better UX
6. Validate inputs before sending to backend
7. Handle offline scenarios gracefully

## Security Notes

- Never expose SUPABASE_SERVICE_ROLE_KEY on the client
- Always use SUPABASE_ANON_KEY for client-side operations
- RLS policies enforce data access automatically
- JWT tokens are handled by Supabase Auth
- CORS is configured on all Edge Functions
- All passwords are hashed by Supabase Auth

## Testing Endpoints

You can test Edge Functions using curl:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/text-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"text":"Test symptom","userId":"test-uuid"}'
```
