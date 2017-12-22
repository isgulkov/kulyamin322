int method(int x, int y, int z)
{
    int a = 0;

    if(y > 4 || y <= 4 && x > 1) {
        a += 2;
    }

    if(y <= 4 && x < 1 || z >= 0 && x > 1) {
        a -= 3;
    }

    return a - 4;
}
