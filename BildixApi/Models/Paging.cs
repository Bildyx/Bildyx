namespace BildixApi.Dtos;

// Clamps client-supplied pagination so a request can't pull unbounded rows.
public static class Paging
{
    public static (int Skip, int Take) Clamp(int offset, int limit) =>
        (Math.Max(0, offset), Math.Clamp(limit, 1, 100));
}
