export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishedAt: string
  readTime: string
  featured: boolean
  image: string
}

export const blogPosts: BlogPost[] = [
  {
    id: "modafinil-vs-adderall",
    slug: "modafinil-vs-adderall",
    title: "Modafinil vs Adderall: A Comprehensive Comparison",
    excerpt: "An in-depth look at the differences between Modafinil and Adderall, including their mechanisms of action, benefits, side effects, and which might be right for you.",
    content: `
## Introduction

When it comes to cognitive enhancement and treating conditions like ADHD and narcolepsy, two medications often come up in conversation: Modafinil and Adderall. While both are used to promote wakefulness and improve focus, they work in fundamentally different ways and have distinct profiles in terms of effects, side effects, and potential for abuse.

## Mechanism of Action

### Modafinil
Modafinil works by affecting several neurotransmitter systems in the brain. It primarily increases dopamine levels by blocking dopamine transporters, but its mechanism is more subtle than traditional stimulants. It also affects histamine, norepinephrine, and orexin systems, contributing to its wakefulness-promoting effects.

### Adderall
Adderall is a combination of amphetamine salts that works by increasing the release of dopamine and norepinephrine while also blocking their reuptake. This results in a more powerful and immediate stimulant effect compared to Modafinil.

## Effects and Benefits

### Modafinil Benefits:
- Sustained focus for 12-15 hours
- Smooth, non-jittery wakefulness
- Lower potential for abuse
- Fewer side effects
- No significant crash when wearing off

### Adderall Benefits:
- Strong, immediate focus enhancement
- Effective for ADHD symptoms
- Can improve mood and motivation
- Well-studied for various conditions

## Side Effects Comparison

Modafinil tends to have milder side effects, including headache, nausea, and insomnia. Adderall can cause more significant side effects like increased heart rate, anxiety, appetite suppression, and potential for dependence.

## Conclusion

Both medications have their place in treating various conditions. Modafinil is often preferred for those seeking cognitive enhancement with a lower side effect profile, while Adderall may be more appropriate for diagnosed ADHD under medical supervision.
    `,
    category: "Comparisons",
    author: "Dr. Sarah Mitchell",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    featured: true,
    image: "https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png",
  },
  {
    id: "modafinil-and-caffeine",
    slug: "modafinil-and-caffeine",
    title: "Modafinil and Caffeine: Can You Combine Them Safely?",
    excerpt: "Many people wonder if it's safe to combine Modafinil with caffeine. Here's what you need to know about mixing these two popular stimulants.",
    content: `
## The Question Everyone Asks

One of the most common questions we receive is whether it's safe to combine Modafinil with caffeine. Given that many Modafinil users are also regular coffee drinkers, this is an important topic to address.

## Understanding the Interaction

Both Modafinil and caffeine are stimulants, but they work through different mechanisms. Modafinil primarily affects dopamine transporters, while caffeine blocks adenosine receptors. This means they can theoretically work synergistically without directly competing for the same receptors.

## Potential Benefits of Combining

Some users report that a moderate amount of caffeine can enhance the wakefulness effects of Modafinil. The combination may provide:

- Enhanced alertness
- Improved focus
- Better mood
- Increased motivation

## Risks and Considerations

However, combining stimulants also carries risks:

- Increased heart rate and blood pressure
- Heightened anxiety
- Difficulty sleeping
- Dehydration
- Overstimulation

## Best Practices

If you choose to combine Modafinil and caffeine:

1. Start with lower doses of both
2. Monitor your heart rate and how you feel
3. Stay well hydrated
4. Avoid combining late in the day
5. Listen to your body and adjust accordingly

## Conclusion

While many people successfully combine Modafinil and caffeine, it's important to do so carefully and be aware of the potential for overstimulation.
    `,
    category: "Guides",
    author: "Dr. James Chen",
    publishedAt: "2024-02-08",
    readTime: "6 min read",
    featured: true,
    image: "https://whalefriend-shop.lovable.app/lovable-uploads/ca2fb5b9-5af5-47c3-8a18-f6b9bbb3ad97.png",
  },
  {
    id: "how-modafinil-works",
    slug: "how-modafinil-works",
    title: "How Does Modafinil Work? The Science Explained",
    excerpt: "A deep dive into the neuroscience behind Modafinil's cognitive-enhancing effects and why it's different from traditional stimulants.",
    content: `
## Understanding Modafinil's Mechanism

Modafinil is classified as a eugeroic or wakefulness-promoting agent. Unlike traditional stimulants, it doesn't simply flood the brain with dopamine. Instead, it works through multiple subtle mechanisms that together promote alertness and cognitive function.

## The Dopamine System

Modafinil binds to dopamine transporters (DAT), blocking the reuptake of dopamine. This increases dopamine levels in the synaptic cleft, enhancing motivation, focus, and cognitive function. However, the binding affinity is lower than amphetamines, resulting in a smoother effect.

## Histamine and Orexin Systems

Modafinil also affects histamine neurons in the hypothalamus and the orexin (hypocretin) system. These systems play crucial roles in regulating the sleep-wake cycle, and their activation contributes to Modafinil's wakefulness-promoting effects.

## Norepinephrine and Glutamate

Additionally, Modafinil increases norepinephrine and glutamate levels while decreasing GABA. This combination enhances alertness and cognitive processing speed.

## Why It Feels Different

The multi-target mechanism explains why Modafinil feels different from caffeine or amphetamines. Users often describe it as "clean" focus without the jitteriness or anxiety associated with other stimulants.

## Conclusion

Modafinil's unique mechanism of action makes it an effective cognitive enhancer with a favorable side effect profile compared to traditional stimulants.
    `,
    category: "Science",
    author: "Dr. Sarah Mitchell",
    publishedAt: "2024-02-20",
    readTime: "7 min read",
    featured: false,
    image: "https://whalefriend-shop.lovable.app/lovable-uploads/e18e391a-2e45-4eea-946e-1bc56f6dbc1e.png",
  },
  {
    id: "modafinil-dosage-guide",
    slug: "modafinil-dosage-guide",
    title: "Modafinil Dosage Guide: Finding Your Optimal Dose",
    excerpt: "Learn how to determine the right Modafinil dosage for your needs, including factors that affect dosing and tips for beginners.",
    content: `
## Finding Your Sweet Spot

One of the most important factors in getting the best results from Modafinil is finding the right dosage. Too little and you might not notice significant effects; too much and you could experience unwanted side effects.

## Standard Dosages

The standard Modafinil dosage ranges from 100mg to 200mg per day. Here's a general breakdown:

- **50mg**: Microdose, subtle effects
- **100mg**: Light dose, good for beginners
- **200mg**: Standard dose, most common
- **300-400mg**: High dose, not recommended for most users

## Factors Affecting Dosage

Several factors can influence your optimal dose:

- Body weight
- Tolerance level
- Sensitivity to stimulants
- Purpose of use
- Individual metabolism

## Tips for Beginners

1. Start with 100mg or even 50mg
2. Take it early in the morning
3. Wait 2-3 hours before considering a second dose
4. Stay hydrated
5. Note how you feel throughout the day

## Splitting the Dose

Some users prefer to split their dose, taking half in the morning and half around noon. This can provide more sustained effects throughout the day.

## When to Take It

For best results, take Modafinil:
- Early in the morning (6-8 AM)
- On an empty stomach or with a light meal
- At least 12-15 hours before planned sleep

## Conclusion

Finding your optimal Modafinil dosage may take some experimentation. Start low, be patient, and pay attention to how your body responds.
    `,
    category: "Guides",
    author: "Dr. James Chen",
    publishedAt: "2024-03-05",
    readTime: "5 min read",
    featured: false,
    image: "https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png",
  },
  {
    id: "armodafinil-vs-modafinil",
    slug: "armodafinil-vs-modafinil",
    title: "Armodafinil vs Modafinil: Which Is Better?",
    excerpt: "A detailed comparison of Armodafinil and Modafinil, including their differences in duration, potency, and which might be better for different situations.",
    content: `
## The R-Enantiomer Question

Armodafinil is often marketed as the "improved" version of Modafinil, but is it actually better? Let's dive into the science and compare these two closely related compounds.

## Chemical Differences

Modafinil is a racemic compound, meaning it contains equal parts of two mirror-image molecules (R and S enantiomers). Armodafinil contains only the R-enantiomer, which is the more pharmacologically active form.

## Duration of Effects

One of the key differences is duration:
- **Modafinil**: 12-15 hours
- **Armodafinil**: 15-18 hours

Armodafinil's longer half-life means it provides sustained effects throughout the day.

## Dosage Equivalence

Due to its higher potency, a lower dose of Armodafinil is needed:
- 150mg Armodafinil ≈ 200mg Modafinil

## Subjective Differences

Users often report different experiences:

### Modafinil:
- Stronger initial onset
- More noticeable peak effects
- Good for morning productivity

### Armodafinil:
- Smoother, more consistent effects
- Less of a "peak and valley" feeling
- Better for all-day focus

## Which Should You Choose?

The best choice depends on your needs:
- Choose **Modafinil** if you want stronger initial effects
- Choose **Armodafinil** if you need sustained focus all day

## Conclusion

Both are excellent cognitive enhancers. Many users try both and stick with the one that works best for their lifestyle and needs.
    `,
    category: "Comparisons",
    author: "Dr. Sarah Mitchell",
    publishedAt: "2024-03-15",
    readTime: "6 min read",
    featured: true,
    image: "https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png",
  },
  {
    id: "modafinil-side-effects",
    slug: "modafinil-side-effects",
    title: "Modafinil Side Effects: What to Expect and How to Manage Them",
    excerpt: "A comprehensive guide to potential Modafinil side effects, from common to rare, and practical tips for managing them.",
    content: `
## Understanding Side Effects

Like any medication, Modafinil can cause side effects. However, most users find them mild and manageable. Understanding what to expect can help you use Modafinil more safely and effectively.

## Common Side Effects

These occur in a significant percentage of users:

- **Headache** (most common): Usually due to dehydration
- **Nausea**: Often occurs when taken on an empty stomach
- **Insomnia**: Taking Modafinil too late in the day
- **Dry mouth**: Related to dehydration
- **Decreased appetite**: Common with all stimulants

## Less Common Side Effects

- Anxiety or nervousness
- Dizziness
- Digestive issues
- Increased heart rate
- Back pain

## Rare but Serious Side Effects

Seek medical attention if you experience:
- Severe allergic reactions (rash, hives, difficulty breathing)
- Chest pain or irregular heartbeat
- Severe mood changes
- Signs of infection (fever, sore throat)

## Managing Side Effects

### For Headaches:
- Drink plenty of water (2-3 liters daily)
- Consider taking with food
- Start with a lower dose

### For Insomnia:
- Take Modafinil early in the morning
- Avoid caffeine after noon
- Practice good sleep hygiene

### For Nausea:
- Take with food
- Start with a lower dose
- Ginger tea can help

## Conclusion

Most Modafinil side effects are mild and can be managed with simple strategies. Always start with a lower dose and pay attention to how your body responds.
    `,
    category: "Health",
    author: "Dr. James Chen",
    publishedAt: "2024-03-25",
    readTime: "7 min read",
    featured: false,
    image: "https://whalefriend-shop.lovable.app/lovable-uploads/ca2fb5b9-5af5-47c3-8a18-f6b9bbb3ad97.png",
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug)
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPosts.filter(p => p.featured)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(p => p.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(blogPosts.map(p => p.category)))
}
