---
title: How I hacked NASA!
date: 2025-02-22 15:56:30
tags:
---

## What was my motivation behind this?

- It started when I was back from uni one day, done with my office work and was aimlessly working on a project to reverse engineer denuvo. At the time I was writing my own hypervisor to take advantage of EPT hooks. While writing code, I was listening to a song called ["All the Things"](https://open.spotify.com/track/3ZzxtumoIENCi16HAKuiLU?si=784848b912fc4e47) by DualCore which had a line that went like "We're not just any geeks, we hack into NASA!". That's when the thought came up: What if I hacked NASA too? I thought it would be really cool if I could. So I set out to feed this urge. ![Elliot](/blog/nasa/elliot.JPG)

## How did I start?

- The first part, almost always is recon. I started with first enumerating subdomains. As it turns out, NASA has a _looot_ of subdomains. 18480 to be precise. I used a combination of tools to enumerate subdomains. Mainly [subdomain finder](https://subdomainfinder.c99.nl/) and [subfinder](https://github.com/projectdiscovery/subfinder). Once that was done, the next few days of my time was spent on simply understanding the actual scope. Figuring out what part of the webapp can and cannot be attacked. I also took to doing a lot of fuzzing on each subdomain I visited.

## When I almost lost interest

- So after a bit of recon and looking around the absolutely massive amount of subdomains, I got busy with life a little. I started spending lesser time on hunting and stopped thinking about it for a while. After a month or so of officially stopping the hunt, I got back on to try a new approach.

- I went back to the same domains that I fuzzed and tried looking for any sort of broken access control vulnerability.

- I took to using some google dorks to find out any exposed endpoints that might have some sensitive information.

- After more fuzzing and dorking I came accross this subdomain in the JPL division of `nasa.gov`. I also tried running nuclei to check if I could find any weird endpoints. Here is the command I used:

```
nuclei -u https://nightsky.jpl.nasa.gov -t /path/to/nuclei-templates/fuzzing/directory-discovery.yaml
```

- But even nuclei couldn't find anything. So I had to go full manual mode.
  ![hackerman](/blog/nasa/hackerman.jpg)

## Finding and exploiting the vulnerability

- So after some manual digging, on that JPL subdomain, I was able to find a directory on which I could act as a privileged user. Instead of getting a 403, I was able to waltz right in by just accessing this hidden directory without enabling any user cookies.
- Once I got in, I poked around a little more to find any pdf files. So for this I used some dorks and specifically searched for PDFs in that directory.
- And **boom**. Just like that, I was able to find some extremely private information of certain affiliated members of JPL.

## Post exploitation

- Once I found the vuln and exploited it, I promptly made a concise report explaining everything that was wrong and what needed to be done to fix it along with the impact that this vuln carries.
- Within about a week or so, I received my [letter of recognition](/nasa) from NASA after my report was triaged!

_Here you can see both mine and my buddy's accepted submission to NASA's VDP_
![accepted](/blog/nasa/accepted.jpeg)
![letter](/blog/nasa/letter.jpeg)

## The bottom line

- A small misconfiguration led to a pretty big exposure of sensitive data. If you’re running a website or server, always make sure your access controls are properly set up, especially when it comes to private or personal information. And if you are hacking the website, then don't forget to fuzz!
- That's all for this one, thanks for reading, and remember, Hack The Planet!
  ![hacktheplanet](/blog/nasa/hacktheplanet.jpg)
