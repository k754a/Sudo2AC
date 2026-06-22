test = 4
test1 = [1, 2, 3, 4]
found = False
for item in test1:
    if item == test:
        found = True
        break
if found:
    print("we did it")
else:
    print("error, not found")