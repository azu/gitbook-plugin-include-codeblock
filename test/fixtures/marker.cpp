// test.cpp source code
int main()
{
    // Test inner markers.

    //! [marker0]
    int a;
    //! [marker1]
    int b;
    //! [marker1]
    int c;
    //! [marker0]

    // Test different comment style.

    /** [marker2] */
    int d;
    /** [marker2] */
    /// [marker3]
    int e;
    /// [marker3]

    // Test different naming and spacing.

    /// [marker 4]
    int f;
    /// [marker 4]

    ///     [marker5 space]
    int g;
    ///  [marker5 space]
    /// [ marker 6 ]
    int h;
    /// [ marker 6 ]
}