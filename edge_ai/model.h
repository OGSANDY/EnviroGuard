#pragma once
#include <cstdarg>
namespace Eloquent {
    namespace ML {
        namespace Port {
            class DecisionTree {
                public:
                    /**
                    * Predict class for features vector
                    */
                    int predict(float *x) {
                        if (x[3] <= 1005.0618896484375) {
                            if (x[2] <= 19.948896408081055) {
                                if (x[0] <= 40.392974853515625) {
                                    return 0;
                                }

                                else {
                                    if (x[1] <= 17.4046950340271) {
                                        return 2;
                                    }

                                    else {
                                        return 0;
                                    }
                                }
                            }

                            else {
                                if (x[1] <= 65.59024047851562) {
                                    if (x[1] <= 65.42335510253906) {
                                        return 1;
                                    }

                                    else {
                                        return 1;
                                    }
                                }

                                else {
                                    if (x[2] <= 55.086225509643555) {
                                        return 1;
                                    }

                                    else {
                                        if (x[1] <= 84.61859893798828) {
                                            return 2;
                                        }

                                        else {
                                            return 2;
                                        }
                                    }
                                }
                            }
                        }

                        else {
                            if (x[1] <= 65.02411651611328) {
                                if (x[0] <= 39.86505699157715) {
                                    return 0;
                                }

                                else {
                                    if (x[1] <= 19.72780132293701) {
                                        return 2;
                                    }

                                    else {
                                        return 0;
                                    }
                                }
                            }

                            else {
                                if (x[2] <= 54.87497520446777) {
                                    return 0;
                                }

                                else {
                                    if (x[1] <= 85.02957153320312) {
                                        return 2;
                                    }

                                    else {
                                        if (x[2] <= 75.43217849731445) {
                                            return 2;
                                        }

                                        else {
                                            return 3;
                                        }
                                    }
                                }
                            }
                        }
                    }

                protected:
                };
            }
        }
    }