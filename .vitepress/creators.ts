export interface SocialEntry {
  type: 'github' | 'twitter' | 'email'
  icon: string
  link: string
}

export interface Creator {
  avatar: string
  name: string
  username?: string
  title?: string
  org?: string
  desc?: string
  links?: SocialEntry[]
  nameAliases?: string[]
  emailAliases?: string[]
}

const getAvatarUrl = (name: string) => `https://github.com/${name}.png`


export const creators: Creator[] = [
  {
    name: '彩虹雨',
    avatar: '',
    username: 'RainbowRain9',
    title: 'RainbowRain',
    desc: '前后端开发，小程序开发，无人机目标检测',
    links: [
      { type: 'github', icon: 'github', link: 'https://github.com/RainbowRain9' }
    ],
    nameAliases: ['rainbowrain', '彩虹雨', 'RainbowRain'],
    emailAliases: ['rainbowrain9@qq.com'],
  },
].map<Creator>((c) => {
  c.avatar = c.avatar || getAvatarUrl(c.username)
  return c as Creator
})

export const creatorNames = creators.map(c => c.name)
export const creatorUsernames = creators.map(c => c.username || '')
