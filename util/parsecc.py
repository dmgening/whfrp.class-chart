#!/usr/bin/env python

"""
Some scary shit hapens here...
Parse cleaned compendum text file, with each career page
on new line
"""
import re
import json


def split_literal(line, literal, append=None):
    head, sep, tail = line.partition(literal)
    if not sep:
        raise ValueError('No such literal "{}" in line: {}'.format(literal, line))
    if append == 'head':
        head += sep
    elif append == 'tail':
        tail = sep + tail
    return head, tail


if __name__ == '__main__':
    results = dict()
    lnum = 0
    with open('cc.full.txt') as compendum:
        for line in compendum.readlines():
            lnum += 1
            srcline = line
            try:
                career = dict()
                # Remove page header and trailing whitespaces
                line = re.sub('^(\d*Careers\d*)+', '', line.strip())
                # Check Profession Type
                for proftype in ('Basic', 'Advanced', 'Special'):
                    if line.startswith(proftype.upper()):
                        career['type'] = proftype
                        line = line[len(proftype):]
                # Remove SPECIAL Tag
                if line.startswith(' / SPECIAL'):
                    career['special'] = True
                    line = line[10:]
                # Find career name
                name = re.match('^[A-Z -]+', line).group()
                name = name[:-2 if name.endswith(' ') else -1]
                career['name'] = name.title()
                line = line[len(name):]
                # Parse quote
                career['quote'], line = split_literal(line, '(', 'tail')
                # Parse description
                if career.get('special'):
                    sep = 'Note: ' if line.find('Note: ') > 0 else 'Special Requirements: '
                    career['description'], line = split_literal(line, sep)
                    career['special'], line = split_literal(line, 'Main Pr')
                else:
                    career['description'], line = split_literal(line, 'Main Pr')
                # Write results to dict
                line = line[line.find('WSBSSTAgIntWPFel') + len('WSBSSTAgIntWPFel'):]
                career['mainprofile'], line = split_literal(line, 'Secondary')
                career['mainprofile'] = career['mainprofile'].replace('\xe2\x80\x93', '+-')\
                    .replace(' ', '').replace('%', '').strip('+').split('+')
                line = line[line.find('AWSBTBMMagIPFP') + len('AWSBTBMMagIPFP'):]
                career['secondaryprofile'], line = split_literal(line, 'Skills: ')
                career['secondaryprofile'] = career['secondaryprofile'].replace('\xe2\x80\x93', '+-')\
                    .replace(' ', '').replace('%', '').strip('+').split('+')
                career['skills'], line = split_literal(line, 'Talents: ')
                career['skills'] = map(lambda x: x.strip(), re.findall('(.+?(?:\(.+?\))?),', career['skills']))
                career['talents'], line = split_literal(line, 'Trappings: ')
                career['talents'] = map(lambda x: x.strip(), re.findall('(.+?(?:\(.+?\))?),', career['talents']))
                career['trappings'], line = split_literal(line, 'Career Entries: ')
                career['trappings'] = map(lambda x: x.strip(), re.findall('(.+?(?:\(.+?\))?),', career['trappings']))
                career['entries'], line = split_literal(line, 'Career Exits: ')
                career['entries'] = map(lambda x: x.strip().lower().replace(' ', '_'), career['entries'].split(','))
                career['exits'] = re.match('^.*?[A-Z][a-z]+[A-Z]', line).group()[:-1]
                career['exits'] = map(lambda x: x.strip().lower().replace(' ', '_'), career['exits'].split(','))
            except Exception, e:
                print '[{2}]ERROR: {0}\nLINE: {1}'.format(e, srcline, lnum)
            results[career.get('name').lower().replace(' ', '_')] = career
    with open('resuls.json', 'w') as results_file:
        json.dump(results, results_file)
