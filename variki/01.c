int method(int x, int y, int z)
{
    int a = 0;

    if(x > 3 && z < 5 || x <= 3 && y > 0) {
        a += 2;
    }

    if(x <= 3 && y < 0 || z >= 5) {
        a += 5;
    }

    return a;
}
