import re, json

with open("database.sql", "r", encoding="utf-8", errors="ignore") as f:
    sql = f.read()

blog_posts = []
for line in sql.split('\n'):
    if "INSERT INTO `SERVMASK_PREFIX_posts`" not in line:
        continue
    m_type = re.search(r"'([^']*)',\s*'([^']*)',\s*(\d+)\);?$", line.strip())
    if not m_type or m_type.group(1) != 'post':
        continue
    
    m_start = re.match(r"INSERT INTO [^\s]+ VALUES \((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'(.*?)',\s*'([^']*)',\s*'(.*?)',\s*'([^']*)',", line)
    if not m_start:
        continue
    
    pid = m_start.group(1)
    pdate = m_start.group(3)
    content = m_start.group(5)
    title = m_start.group(6)
    status = m_start.group(8)
    
    if status != 'publish':
        continue
    
    m_slug = re.search(r",'publish','(?:open|closed)','(?:open|closed)','[^']*','([^']*)',", line)
    slug = m_slug.group(1) if m_slug else ""
    
    # Clean content - strip Divi shortcodes, keep HTML
    clean = content.replace('\\n', '\n').replace('\\t', '\t').replace("\\'", "'").replace('\\"', '"')
    clean = re.sub(r'\[/?et_pb_[^\]]*\]', '', clean)
    clean = re.sub(r'<!-- wp:[^>]+ -->', '', clean)
    clean = re.sub(r'<!-- /wp:[^>]+ -->', '', clean)
    
    blog_posts.append({
        'id': pid,
        'title': re.sub(r'<[^>]+>', '', title),
        'slug': slug,
        'date': pdate,
        'content': clean.strip(),
        'excerpt': re.sub(r'<[^>]+>', '', clean)[:200].strip() + '...'
    })

with open("data/blog-posts.json", 'w') as f:
    json.dump(blog_posts, f, indent=2)

print(f"Extracted {len(blog_posts)} blog posts")
for p in blog_posts:
    print(f"  {p['slug']}: {p['title']}")
