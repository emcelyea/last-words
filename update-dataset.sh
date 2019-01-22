curl "https://www.tdcj.texas.gov/death_row/dr_executed_offenders.html" |
grep "title=\"Last Statement" |
grep -Eo "(?:href=\").*?\.html" |
cut -c 7-
