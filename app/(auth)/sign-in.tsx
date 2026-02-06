import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { useAuth, useSignIn } from "@clerk/clerk-expo";

import type { EmailCodeFactor } from '@clerk/types';
import { Link, useRouter } from "expo-router";
import * as React from 'react';
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

const SignIn = () => {
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    useEffect(() => {
        if (!authLoaded) return;

        if (isSignedIn) {
            router.replace("/(root)/(tabs)/home");
        }
    }, [authLoaded, isSignedIn]);

    const { signIn, setActive, isLoaded } = useSignIn()
    const [verification, setVerification] = useState({
        state: "default",
        error: "",
        code: ""
    });
    const [showEmailCode, setShowEmailCode] = useState(false)
    const [code, setCode] = React.useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) return

        // Start the sign-in process using the email and password provided
        try {
            const signInAttempt = await signIn.create({
                identifier: form.email,
                password: form.password,
            })


            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            // Check for tasks and navigate to custom UI to help users resolve them
                            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                            console.log(session?.currentTask)
                            return
                        }

                        router.replace('/(root)/(tabs)/home')
                    },
                })

                setVerification({...verification, state: "success"})
            } else if (signInAttempt.status === 'needs_second_factor') {
                // Check if email_code is a valid second factor
                // This is required when Client Trust is enabled and the user
                // is signing in from a new device.
                // See https://clerk.com/docs/guides/secure/client-trust
                const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
                    (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
                )

                if (emailCodeFactor) {
                    await signIn.prepareSecondFactor({
                        strategy: 'email_code',
                        emailAddressId: emailCodeFactor.emailAddressId,
                    })
                    setShowEmailCode(true)
                }
                setVerification({...verification, state: "pending"})
            } else {
                setVerification({
                    ...verification,
                    state: "failed",
                    error: "Verification failed."
                })
            }
        } catch (err: any) {
            setVerification({
                ...verification,
                error: err.errors[0].longMessage,
                state: "failed"
            })
        }
    }, [isLoaded, signIn, setActive, router, form.email, form.password])

    // Handle the submission of the email verification code
    const onVerifyPress = React.useCallback(async () => {
        if (!isLoaded) return

        try {
            console.log("2FA code:", verification.code);
            const signInAttempt = await signIn.attemptSecondFactor({
                strategy: 'email_code',
                code: verification.code,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({
                    session: signInAttempt.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            // Check for tasks and navigate to custom UI to help users resolve them
                            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                            console.log(session?.currentTask)
                            return
                        }

                        router.replace('/(root)/(tabs)/home')
                    },
                })
                setVerification({...verification, state: "success"})
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }, [isLoaded, signIn, setActive, router, code])

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
                    <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                        Welcome 👋
                    </Text>
                </View>
                <View className="p-5">
                    <InputField
                        label="Email"
                        placeholder="Enter email"
                        icon={icons.email}
                        textContentType="emailAddress"
                        value={form.email}
                        keyboardType="ascii-capable"
                        onChangeText={(value) => setForm({ ...form, email: value })}
                    />
                    <InputField
                        label="Password"
                        placeholder="Enter password"
                        icon={icons.lock}
                        secureTextEntry={true}
                        textContentType="password"
                        value={form.password}
                        onChangeText={(value) => setForm({ ...form, password: value })}
                    />
                    <CustomButton
                        title="Sign In"
                        onPress={onSignInPress}
                        disabled={isSignedIn}
                        className="mt-6"
                    />
                    <OAuth />

                    <Link
                        href="/sign-up"
                        className="text-lg text-center text-general-200 mt-10"
                    >
                        Don't have an account?{" "}
                        <Text className="text-primary-500">Sign Up</Text>
                    </Link>
                </View>

                {/* React Native Modal */}
                <ReactNativeModal isVisible={verification.state === "pending"} onModalHide={() => {
                    if (verification.state === "success") {
                        setShowSuccessModal(true);
                    }
                }}>
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Text className="font-JakartaExtraBold text-2xl mb-2">
                            Verification
                        </Text>
                        <Text className="font-Jakarta mb-5">
                            We've sent a verification code to {form.email}.
                        </Text>
                        <InputField
                            label={"Code"}
                            icon={icons.lock}
                            placeholder={"12345"}
                            value={verification.code}
                            keyboardType="numeric"
                            onChangeText={(code) =>
                                setVerification({ ...verification, code })
                            }
                        />
                        {verification.error && (
                            <Text className="text-red-500 text-sm mt-1">
                                {verification.error}
                            </Text>
                        )}
                        <CustomButton
                            title="Verify Email"
                            onPress={onVerifyPress}
                            className="mt-5 bg-success-500"
                        />
                    </View>
                </ReactNativeModal>
                <ReactNativeModal isVisible={showSuccessModal}>
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Image
                            source={images.check}
                            className="w-[110px] h-[110px] mx-auto my-5"
                        />
                        <Text className="text-3xl font-JakartaBold text-center">
                            Verified
                        </Text>
                        <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                            You have successfully verified your account.
                        </Text>
                        <CustomButton
                            title="Browse Home"
                            onPress={() => router.push(`/(root)/(tabs)/home`)}
                            className="mt-5"
                        />
                    </View>
                </ReactNativeModal>
            </View>
        </ScrollView>
    );
};
export default SignIn;