---
title: My Experience With VDP and Bug Bounties
date: 2023-04-07 01:54:20
tags:
---

## Recon

- My initial approach to working on a VDP was to spend a lot of time doing recon
- I had spent around 1 month with recon alone just to figure out my scope and find out all the possible subdomains I can test.
- Apart from enumerating subdomains I also spent time finding out some of the most commonly recurring software used on the webpages.
- Figuring out what software the website runs is a huge advantage to exploit it
- During the recon process I also took the time to do parameter injection to find parameters that might potentially be vulnerable to cross site scripting or XSS.

## Exploiting

- After recon, the next step is almost always exploiting any potential vulnerabilities.
- While testing Stanford University's website, I stumbled upon a few subdomains that may potentially be vulnerable to XSS.
- This was determined with the help of parameter injection directly into the URL
- Parameter injection can be automated to an extent which allows for quick filtering.
- A useful tool I use for quick parameter injection/scanning is [paramspider](https://github.com/devanshbatham/ParamSpider):

```
python3 paramspider.py -d https://exampletarget.com -o /home/icarus/Desktop/out.txt
```

- As for the Cambridge University VDP, the simple technique of finding exploits in vulnerable software versions worked. An Atlassian suite software called JIRA contained an exploitable CVE which had a medium severity.
- For the Stanford VDP, after finding the correct subdomain, an SVG injecton was tried and I was able to add a number of html divs and images on load. I was also able to load scripts into the website

## Post Exploitation

- Generally, a good practice is to promptly report any findings back to the organization as soon as you are done with a penetration test
- This is what I ended up doing and received an acknowledgement from both Stanford and Cambridge University.
