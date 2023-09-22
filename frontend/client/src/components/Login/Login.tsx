import {
    TextInput,
    PasswordInput,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
    Center,
    LoadingOverlay,
    Flex,
} from "@mantine/core";
import { useForm, isEmail, hasLength } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import {
    IconCheck,
    IconX,
    IconAt,
    IconLock,
    IconChevronLeft,
    IconBrandFacebook,
    IconBrandGoogle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";

import { authService } from "../../services/auth.service";
import { AuthContext } from "../../providers/AuthProvider/AuthProvider";
import { createWindow } from "../../helpers/createWindow.helper";

export function LoginAuth() {
    const [loading, setLoading] = useState(false);
    const [isOAuth, setIsOAuth] = useState({
        status: false,
        method: "",
    });

    const { setProfile } = useContext(AuthContext);

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },

        validateInputOnBlur: true,

        validate: {
            email: isEmail("Invalid email"),
            password: hasLength(
                { min: 8, max: 20 },
                "Value must have 8 or more characters"
            ),
        },
    });

    const navigate = useNavigate();

    const handleError = (errors: typeof form.errors): void => {
        if (errors.password) {
            showNotification({
                message: "Pass word incorrect",
                color: "red",
            });
        } else if (errors.email) {
            showNotification({
                message: "Please provide a valid email",
                color: "red",
            });
        }
    };

    const handleSubmit = (values: typeof form.values): void => {
        setIsOAuth((prev: { status: boolean; method: string }) => ({
            ...prev,
            status: false,
        }));

        handleValidate(values);
    };

    const handleValidate = async (values: typeof form.values) => {
        try {
            setLoading(true);
            await authService.login(values);
            setLoading(false);
            showNotification({
                message: "You login successfully!",
                color: "yellow",
                icon: <IconCheck />,
                autoClose: 3000,
            });
            const response = await authService.getProfile();
            setProfile(response.data);
            localStorage.setItem("isAuthenticated", "true");
            navigate("/");
            form.reset();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showNotification({
                title: "Login failure!",
                message: error.response.data.message,
                color: "red",
                icon: <IconX />,
                autoClose: 3000,
            });
            setLoading(false);
        }
    };

    const handleLoginWithGoogle = () => {
        setIsOAuth((prev: { status: boolean; method: string }) => ({
            ...prev,
            status: false,
        }));

        let timer: ReturnType<typeof setTimeout> | null = null;

        const newWindow = createWindow(
            "http://localhost:8888/api/v1/auth/google/login",
            "_blank",
            800,
            600
        );

        if (newWindow) {
            timer = setInterval(() => {
                if (newWindow.closed) {
                    JSON.parse(
                        localStorage.getItem("isAuthenticated") as string
                    )
                        ? navigate("/")
                        : setIsOAuth({
                              method: "Google",
                              status: true,
                          });

                    if (timer) clearInterval(timer);
                }
            }, 500);
        }
    };

    const handleLoginWithFacebook = () => {
        setIsOAuth((prev: { status: boolean; method: string }) => ({
            ...prev,
            status: false,
        }));

        let timer: ReturnType<typeof setTimeout> | null = null;
        const newWindow = createWindow(
            "http://localhost:8888/api/v1/auth/facebook/login",
            "_blank",
            800,
            600
        );

        if (newWindow) {
            timer = setInterval(() => {
                if (newWindow.closed) {
                    JSON.parse(
                        localStorage.getItem("isAuthenticated") as string
                    )
                        ? navigate("/")
                        : setIsOAuth({
                              method: "Facebook",
                              status: true,
                          });

                    if (timer) clearInterval(timer);
                }
            }, 500);
        }
    };

    useEffect(() => {
        if (JSON.parse(localStorage.getItem("isAuthenticated") as string))
            navigate(-1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Link to="/">
                <Group spacing={0}>
                    <IconChevronLeft />
                    <Text color="gray">Quay về trang chủ</Text>
                </Group>
            </Link>
            <Center>
                <Container size={420} my={40}>
                    <Title
                        align="center"
                        sx={(theme) => ({
                            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                            fontWeight: 900,
                        })}
                    >
                        PERFUME & LDA!
                    </Title>
                    <Text color="dimmed" size="sm" align="center" mt={5}>
                        Bạn đã có tài khoản chưa?{" "}
                        <Link to="/register" style={{ color: "blue" }}>
                            Đăng ký
                        </Link>
                    </Text>

                    <Flex
                        style={{ width: "100%" }}
                        justify="center"
                        gap="md"
                        mt={10}
                    >
                        <Group>
                            <Button onClick={() => handleLoginWithFacebook()}>
                                <IconBrandFacebook />
                                &nbsp;
                                <Text>FACEBOOK</Text>
                            </Button>
                        </Group>

                        <Group>
                            {/* <form
                                action="http://localhost:4000/api/v1/auth/google/login"
                                method="get"
                            >
                                <Button color="red" type="submit">
                                    <IconBrandGoogle />
                                    &nbsp;
                                    <Text>GOOGLE</Text>
                                </Button>
                            </form> */}

                            <Button
                                color="red"
                                onClick={() => handleLoginWithGoogle()}
                            >
                                <IconBrandGoogle />
                                &nbsp;
                                <Text>GOOGLE</Text>
                            </Button>
                        </Group>
                    </Flex>
                    <Flex mt={8}>
                        {isOAuth.status && (
                            <span style={{ color: "red" }}>
                                Email này đã được sử dụng cho 1 hình thức đăng
                                nhập khác {isOAuth.method}
                            </span>
                        )}
                    </Flex>

                    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                        <form
                            onSubmit={form.onSubmit(handleSubmit, handleError)}
                        >
                            <TextInput
                                label="Email"
                                placeholder="lda@gmail.com"
                                icon={<IconAt size={16} />}
                                required
                                {...form.getInputProps("email")}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Your password"
                                icon={<IconLock size={16} />}
                                required
                                mt="md"
                                {...form.getInputProps("password")}
                            />
                            <Group position="apart" mt="lg">
                                <Link
                                    to="/forgot_password"
                                    style={{ color: "blue" }}
                                >
                                    Quên mật khẩu ?
                                </Link>
                            </Group>
                            <Button
                                fullWidth
                                mt="xl"
                                type="submit"
                                disabled={loading}
                            >
                                Đăng nhập
                            </Button>
                            <LoadingOverlay
                                sx={{ position: "fixed", height: "100%" }}
                                loaderProps={{
                                    size: "sm",
                                    color: "pink",
                                    variant: "oval",
                                }}
                                overlayOpacity={0.3}
                                overlayColor="#c5c5c5"
                                visible={loading}
                            />
                        </form>
                    </Paper>
                </Container>
            </Center>
        </>
    );
}
